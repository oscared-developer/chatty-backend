import { CustomError, IErrorResponse } from './shared/globals/helper/error-handler';
import { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import 'express-async-errors';
import { config } from './config';
import appRoutes from './routes';

const SERVER_PORT = 5001;
const log = config.createLogger('setupServer');

export class Server {
  private readonly app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standartMiddleware(this.app);
    this.routeMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600000, // 7 days
        secure: config.NODE_ENV !== 'development'
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standartMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routeMiddleware(app: Application): void {
    appRoutes(app);
  }

  private globalErrorHandler(app: Application): void {
    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error(error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }

      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: HttpServer = new HttpServer(app);
      const socketIO = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

  private async createSocketIO(httpServer: HttpServer): Promise<SocketIOServer> {
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
      }
    });

    const pubClient = createClient({ url: config.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private socketIOConnections(io: SocketIOServer): void {}

  private startHttpServer(httpServer: HttpServer): void {
    log.info(`Server has started with process ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server running on port: ${SERVER_PORT}`);
    });
  }
}
