"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
require("express-async-errors");
const path_1 = require("path");
const url_1 = require("url");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const logger_js_1 = require("./infrastructure/logging/logger.js");
const bootstrap_js_1 = require("./infrastructure/bootstrap/bootstrap.js");
const taskRoutes_js_1 = require("./presentation/routes/taskRoutes.js");
const errorHandler_js_1 = require("./presentation/middleware/errorHandler.js");
const __dirname = (0, path_1.dirname)((0, url_1.fileURLToPath)(import.meta.url));
function createApp() {
    const app = (0, express_1.default)();
    app.set('trust proxy', 1);
    app.use((0, helmet_1.default)({
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
    app.use((0, cors_1.default)({
        origin: process.env.CLIENT_URL || false,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id']
    }));
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
        max: parseInt(process.env.RATE_LIMIT_MAX || '1000'),
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
    app.use((0, compression_1.default)());
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use(errorHandler_js_1.correlationIdMiddleware);
    app.use(errorHandler_js_1.requestLoggingMiddleware);
    app.use(express_ejs_layouts_1.default);
    app.set('view engine', 'ejs');
    app.set('views', (0, path_1.join)(__dirname, '..', 'views'));
    app.set('layout', 'layouts/main');
    app.use(express_1.default.static((0, path_1.join)(__dirname, '..', 'public')));
    const container = (0, bootstrap_js_1.bootstrap)();
    app.get('/health', async (req, res) => {
        try {
            const prisma = container.resolve('prismaClient');
            await prisma.$queryRaw `SELECT 1`;
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0',
                uptime: process.uptime(),
                memory: process.memoryUsage()
            });
        }
        catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    });
    app.get('/', async (req, res) => {
        try {
            res.render('tasks/index', {
                title: 'Todo App',
                tasks: [],
                filters: {},
                pagination: { page: 1, pages: 1, total: 0 }
            });
        }
        catch (error) {
            logger_js_1.logger.error('Error rendering main page', { error });
            res.status(500).render('errors/500', {
                title: 'Server Error',
                message: 'An error occurred while loading the page'
            });
        }
    });
    const taskController = container.resolve('taskController');
    app.use('/api', (0, taskRoutes_js_1.createTaskRoutes)(taskController));
    app.use('/api/*', errorHandler_js_1.notFoundHandler);
    app.use(errorHandler_js_1.errorHandler);
    return app;
}
exports.default = createApp;
//# sourceMappingURL=app.js.map