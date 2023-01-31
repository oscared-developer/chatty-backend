import express, { Express } from 'express';
import databaseConnection from './setupDB';
import { Server } from './setupServer';
import { config } from './config';

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
  }
}

const app = new Application();
app.initialize();
