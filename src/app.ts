import express, { Express } from 'express';
import databaseConnection from '@root/setupDB';
import { Server } from '@root/setupServer';
import { config } from '@root/config';

class Application {
  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app: Express = express();
    const server: Server = new Server(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const app = new Application();
app.initialize();
