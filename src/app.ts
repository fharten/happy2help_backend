import cors from 'cors';
import express from 'express';
import path from 'path';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Ngo } from './models/ngoModel';
import { Application } from './models/applicationModel';
import { Category } from './models/categoryModel';
import { Project } from './models/projectModel';
import { Skill } from './models/skillModel';
import { User } from './models/userModel';
import { Notification } from './models/notificationModel';
import { RefreshToken } from './models/refreshTokenModel';
import { SecurityService } from './services/securityService';

// LOAD ENV
config();

const app = express();
const PORT = Number(process.env.PORT) || 3333;
const dbpath =
  process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_PATH_PRODUCTION
      ? process.env.DATABASE_PATH_PRODUCTION
      : ''
    : 'database.sqlite';

// DB CONNECTION
const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: dbpath,
  entities: [Application, Category, Ngo, Notification, Project, RefreshToken, Skill, User], // Add your entities here
  synchronize: process.env.NODE_ENV !== 'production', // SET TO FALSE IN PRODUCTION
  logging: false,
});

// MIDDLEWARE
const corsOptions = {
  origin: process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',') : true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC FILE SERVING FOR UPLOADS
const uploadsPath =
  process.env.NODE_ENV === 'production'
    ? process.env.UPLOADS_PATH || '/home/h2h/uploads'
    : path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// BASIC ROUTES
app.get('/', (req, res) => {
  res.json({ message: 'API is running!' });
});

// INITIALIZE DB AND START SERVER
const startServer = async () => {
  AppDataSource.initialize();
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const applicationRoutes = require('./routes/applicationRoutes').default;
    const authRoutes = require('./routes/authRoutes').default;
    const ngoRoutes = require('./routes/ngoRoutes').default;
    const notificationRoutes = require('./routes/notificationRoutes').default;
    const projectRoutes = require('./routes/projectRoutes').default;
    const skillRoutes = require('./routes/skillRoutes').default;
    const userRoutes = require('./routes/userRoutes').default;
    const categoryRoutes = require('./routes/categoryRoutes').default;

    app.use('/api/applications', applicationRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/ngos', ngoRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/skills', skillRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/categories', categoryRoutes);

    // VALIDATE SECURITY SETTINGS
    const securityValidation = SecurityService.validateSecuritySettings();
    if (!securityValidation.isValid) {
      console.error('Security configuration errors:');
      securityValidation.errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }

    if (securityValidation.warnings.length > 0) {
      console.warn('Security configuration warnings:');
      securityValidation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    // START SECURITY SERVICES
    SecurityService.startTokenCleanup(3600000); // Every hour
    // UNCOMMENT TO ENABLE MONTHLY KEY ROTATION REMINDERS:
    // SecurityService.scheduleKeyRotation(30 * 24 * 60 * 60 * 1000); // Every 30 days

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('JWT security features enabled');
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

export { AppDataSource };
export default app;
