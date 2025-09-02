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

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3333;

// Database connection
const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DATABASE_PATH || 'database.sqlite',
  entities: [Application, Category, Ngo, Notification, Project, Skill, User], // Add your entities here
  synchronize: true, // Set to false in production
  logging: false,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'API is running!' });
});

// Initialize database and start server
const startServer = async () => {
  AppDataSource.initialize();
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const ngoRoutes = require('./routes/ngoRoutes').default;

    app.use('/api/ngos', ngoRoutes);

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
