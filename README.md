# Backend

![Node.js](https://img.shields.io/badge/Node.s-Express-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-5.1.0-000000?logo=express&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript&logoColor=white) ![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white) ![TypeORM](https://img.shields.io/badge/TypeORM-0.3.26-E83524?logo=typeorm&logoColor=white) [![Deploy to Uberspace](https://github.com/fharten/happy2help_backend/actions/workflows/deploy-to-uberspace.yml/badge.svg)](https://github.com/fharten/happy2help_backend/actions/workflows/deploy-to-uberspace.yml)

<div style="text-align: center;">
  <img src="https://raw.githubusercontent.com/fharten/happy2help_frontend/refs/heads/main/public/images/deployed/homepage.png" width="600" alt='Happy2Help Frontpage'>
</div>

## About

Our app connects passionate volunteers with impactful registered associations. Discover meaningful projects, apply with a tap, and turn your time and talent into real-world change. One platform. Countless causes. A better world—together.

## Tech Stack

### Core Framework

- **Express 5.1.0** - Fast, minimalist web framework for Node.js with robust routing, middleware support, and excellent ecosystem. Chosen for its simplicity, performance, and extensive community support.
- **TypeScript 5.9.2** - Static type checking for enhanced code quality, better developer experience, and reduced runtime errors in server-side development.
- **Node.js** - JavaScript runtime built on Chrome's V8 engine, enabling server-side JavaScript execution with excellent performance.

### Database & ORM

- **better-sqlite3** - Fast, synchronous SQLite3 bindings for Node.js with better performance than node-sqlite3. Ideal for development and small to medium-scale applications.
- **TypeORM 0.3.26** - Object-relational mapping library with TypeScript support, providing:
  - Entity-based data modeling with decorators
  - Type-safe database queries
  - Migration system for schema changes
  - Repository pattern for data access

### Authentication & Security

- **bcrypt** - Industry-standard password hashing library using adaptive hashing functions for secure password storage
- **jsonwebtoken** - JWT implementation for stateless authentication and authorization
- **CORS** - Cross-Origin Resource Sharing middleware for handling frontend-backend communication securely

### File Handling & Utilities

- **multer** - Middleware for handling multipart/form-data, primarily used for file uploads with configurable storage options
- **uuid** - RFC4122 UUID generator for creating unique identifiers
- **dotenv** - Environment variable loader from .env files for configuration management

### Development Tools

- **nodemon** - Development utility that automatically restarts the server when file changes are detected
- **ts-node** - TypeScript execution engine for Node.js, enabling direct execution of TypeScript files without compilation
- **ESLint** - Code linting with TypeScript support and Prettier integration for consistent code quality
- **Prettier** - Code formatting tool for maintaining consistent code style across the project

### Type Definitions

- **@types/\*** packages - TypeScript type definitions for:
  - Express and middleware
  - bcrypt for password hashing
  - multer for file uploads
  - jsonwebtoken for JWT handling
  - Node.js core modules
  - uuid for identifier generation

### Architecture Benefits

- **CommonJS** - Module system for better compatibility with Node.js ecosystem
- **Decorator Support** - Experimental decorators enabled for TypeORM entity definitions
- **Structured Source** - Organized codebase with services, types, and clear separation of concerns
