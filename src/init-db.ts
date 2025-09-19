import { AppDataSource } from './app';

const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Initialize the data source - this will create the tables
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    // Force synchronization to create tables (even in production)
    await AppDataSource.synchronize(true);
    console.log('Database schema synchronized successfully');

    console.log('✅ Database initialization completed!');
    console.log('You can now run "npm run seed" to populate with sample data');

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
};

if (require.main === module) {
  initializeDatabase();
}

export default initializeDatabase;