import cors from 'cors';
import express from 'express';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Ngo } from './models/ngoModel';
import { Application } from './models/applicationModel';
import { Category } from './models/categoryModel';
import { Project } from './models/projectModel';
import { Skill } from './models/skillModel';
import { User } from './models/userModel';
import { Notification } from './models/notificationModel';
import { RefreshToken } from './models/tokenModel';
import { RevokedToken } from './models/revokedTokenModel';
import { TokenService } from './services/tokenService';
import { KeyManager } from './utils/keyManager';

// LOAD ENV
config();

const app = express();
const PORT = process.env.PORT || 3333;

// DB CONNECTIONS
const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DATABASE_PATH || 'database.sqlite',
  entities: [
    Application,
    Category,
    Ngo,
    Notification,
    Project,
    Skill,
    User,
    RefreshToken,
    RevokedToken,
  ], // Add your entities here
  synchronize: true, // Set to false in production
  logging: false,
});

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// BASIC ROUTES
app.get('/', (req, res) => {
  res.json({ message: 'API is running!' });
});

// INIT DB AND START SERVER
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    // INIT SECURITY SSERVICES
    await KeyManager.initialize();
    await TokenService.initialize();
    console.log('Security services initialized');


    const applicationRoutes = require('./routes/applicationRoutes').default;
    const authRoutes = require('./routes/authRoutes').default;
    const ngoRoutes = require('./routes/ngoRoutes').default;
    const notificationRoutes = require('./routes/notificationRoutes').default;
    const projectRoutes = require('./routes/projectRoutes').default;
    const skillRoutes = require('./routes/skillRoutes').default;
    const userRoutes = require('./routes/userRoutes').default;

    app.use('/api/applications', applicationRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/ngos', ngoRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/skills', skillRoutes);
    app.use('/api/users', userRoutes);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

export { AppDataSource };
export default app;
