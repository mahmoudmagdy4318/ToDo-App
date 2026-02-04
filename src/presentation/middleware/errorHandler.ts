import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infrastructure/logging/logger.js';
import { ValidationError, NotFoundError, ConflictError } from '../../domain/entities/Task.js';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  traceId?: string;
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const traceId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  
  // Log error with context
  logger.error('Request failed', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    traceId,
    timestamp: new Date().toISOString()
  });

  let problemDetails: ProblemDetails;

  if (err instanceof ValidationError) {
    problemDetails = {
      type: 'https://httpstatuses.com/400',
      title: 'Validation Failed',
      status: 400,
      detail: err.message,
      instance: req.path,
      traceId
    };
  } else if (err instanceof NotFoundError) {
    problemDetails = {
      type: 'https://httpstatuses.com/404',
      title: 'Resource Not Found',
      status: 404,
      detail: err.message,
      instance: req.path,
      traceId
    };
  } else if (err instanceof ConflictError) {
    problemDetails = {
      type: 'https://httpstatuses.com/409',
      title: 'Conflict',
      status: 409,
      detail: err.message,
      instance: req.path,
      traceId
    };
  } else {
    problemDetails = {
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      instance: req.path,
      traceId
    };
  }

  res.status(problemDetails.status).json(problemDetails);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const problemDetails: ProblemDetails = {
    type: 'https://httpstatuses.com/404',
    title: 'Not Found',
    status: 404,
    detail: `The requested resource ${req.path} was not found`,
    instance: req.path
  };

  res.status(404).json(problemDetails);
};

// Add correlation ID to requests
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
};

// Request logging middleware
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      correlationId: req.headers['x-correlation-id']
    });
  });

  next();
};
