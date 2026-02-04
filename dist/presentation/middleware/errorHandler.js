"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLoggingMiddleware = exports.correlationIdMiddleware = exports.notFoundHandler = exports.errorHandler = void 0;
const logger_js_1 = require("../../infrastructure/logging/logger.js");
const Task_js_1 = require("../../domain/entities/Task.js");
const errorHandler = (err, req, res, next) => {
    const traceId = req.headers['x-correlation-id'] || crypto.randomUUID();
    logger_js_1.logger.error('Request failed', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        traceId,
        timestamp: new Date().toISOString()
    });
    let problemDetails;
    if (err instanceof Task_js_1.ValidationError) {
        problemDetails = {
            type: 'https://httpstatuses.com/400',
            title: 'Validation Failed',
            status: 400,
            detail: err.message,
            instance: req.path,
            traceId
        };
    }
    else if (err instanceof Task_js_1.NotFoundError) {
        problemDetails = {
            type: 'https://httpstatuses.com/404',
            title: 'Resource Not Found',
            status: 404,
            detail: err.message,
            instance: req.path,
            traceId
        };
    }
    else if (err instanceof Task_js_1.ConflictError) {
        problemDetails = {
            type: 'https://httpstatuses.com/409',
            title: 'Conflict',
            status: 409,
            detail: err.message,
            instance: req.path,
            traceId
        };
    }
    else {
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
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    const problemDetails = {
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: `The requested resource ${req.path} was not found`,
        instance: req.path
    };
    res.status(404).json(problemDetails);
};
exports.notFoundHandler = notFoundHandler;
const correlationIdMiddleware = (req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
};
exports.correlationIdMiddleware = correlationIdMiddleware;
const requestLoggingMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_js_1.logger.info('HTTP Request', {
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
exports.requestLoggingMiddleware = requestLoggingMiddleware;
//# sourceMappingURL=errorHandler.js.map