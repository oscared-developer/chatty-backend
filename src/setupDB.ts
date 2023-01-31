import mongoose from 'mongoose';
import { config } from './config';
const log = config.createLogger('setupDatabase');

export default () => {
  const connect = () => {
    mongoose.set('strictQuery', false);
    mongoose
      .connect(config.DATABASE_URL!)
      .then(() => {
        log.info('Successfully connected to database');
      })
      .catch((error) => {
        log.error('Error connecting to database', error);
        process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};
