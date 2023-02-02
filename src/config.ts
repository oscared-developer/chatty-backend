import dotenv from 'dotenv';
import bunyan from 'bunyan';
import cloudinary from 'cloudinary';

dotenv.config({});
type envVariable = string | undefined;
const { env } = process;

class Config {
  public DATABASE_URL: envVariable;
  public JWT_TOKEN: envVariable;
  public NODE_ENV: envVariable;
  public SECRET_KEY_ONE: envVariable;
  public SECRET_KEY_TWO: envVariable;
  public CLIENT_URL: envVariable;
  public REDIS_URL: envVariable;
  public CLOUD_NAME: envVariable;
  public CLOUD_API_KEY: envVariable;
  public CLOUD_API_SECRET: envVariable;

  private readonly DEFAULT_DATABASE = 'mongodb://localhost:27017/chatty-backend';

  constructor() {
    this.DATABASE_URL = env.DATABASE_URL || this.DEFAULT_DATABASE;
    this.JWT_TOKEN = env.JWT_TOKEN || '1234';
    this.NODE_ENV = env.NODE_ENV || '';
    this.SECRET_KEY_ONE = env.SECRET_KEY_ONE || '';
    this.SECRET_KEY_TWO = env.SECRET_KEY_TWO || '';
    this.CLIENT_URL = env.CLIENT_URL || '';
    this.REDIS_URL = env.REDIS_URL || '';
    this.CLOUD_NAME = env.CLOUD_NAME || '';
    this.CLOUD_API_KEY = env.CLOUD_API_KEY || '';
    this.CLOUD_API_SECRET = env.CLOUD_API_SECRET || '';
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: 'debug' });
  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration:: ${key} is undefined`);
      }
    }
  }

  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET
    });
  }
}

export const config = new Config();
