import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import expressLayouts from 'express-ejs-layouts';
import 'express-async-errors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables
config();

import { logger } from './infrastructure/logging/logger.js';
import { bootstrap } from './infrastructure/bootstrap/bootstrap.js';
import { createTaskRoutes } from './presentation/routes/taskRoutes.js';
import { TaskController } from './presentation/controllers/TaskController.js';
import { 
  errorHandler, 
  notFoundHandler, 
  correlationIdMiddleware, 
  requestLoggingMiddleware 
} from './presentation/middleware/errorHandler.js';

// Get current directory for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  // Trust proxy for production deployments behind load balancers
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://cdn.jsdelivr.net"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.CLIENT_URL || false,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id']
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000'), // limit each IP to 1000 requests per windowMs
    message: {
      type: 'https://httpstatuses.com/429',
      title: 'Too Many Requests',
      status: 429,
      detail: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  app.use('/api', limiter);

  // Compression middleware
  app.use(compression());

  // Request parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Add correlation ID to requests
  app.use(correlationIdMiddleware);

  // Request logging
  app.use(requestLoggingMiddleware);

  // View engine setup for EJS
  app.use(expressLayouts);
  app.set('view engine', 'ejs');
  app.set('views', join(__dirname, '..', 'views'));
  app.set('layout', 'layouts/main');

  // Static files
  app.use(express.static(join(__dirname, '..', 'public')));

  // Bootstrap dependency injection
  const container = bootstrap();

  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const prisma = container.resolve('prismaClient');
      await prisma.$queryRaw`SELECT 1`;

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Main todo page route
  app.get('/', async (req, res) => {
    try {
      // For now, just render the page - we'll implement the full view logic later
      res.render('tasks/index', {
        title: 'Todo App',
        tasks: [],
        filters: {},
        pagination: { page: 1, pages: 1, total: 0 }
      });
    } catch (error) {
      logger.error('Error rendering main page', { error });
      res.status(500).render('errors/500', { 
        title: 'Server Error',
        message: 'An error occurred while loading the page'
      });
    }
  });

  // API routes
  const taskController = container.resolve<TaskController>('taskController');
  app.use('/api', createTaskRoutes(taskController));

  // 404 handler for API routes
  app.use('/api/*', notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
}

export default createApp;
