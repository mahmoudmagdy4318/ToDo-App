"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const logger_js_1 = require("./infrastructure/logging/logger.js");
const prisma_js_1 = __importDefault(require("./infrastructure/database/prisma.js"));
const PORT = process.env.PORT || 3000;
async function startServer() {
    try {
        await prisma_js_1.default.$connect();
        logger_js_1.logger.info('Connected to database');
        const app = (0, app_js_1.default)();
        const server = app.listen(PORT, () => {
            logger_js_1.logger.info(`Server running on port ${PORT}`, {
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                timestamp: new Date().toISOString()
            });
        });
        const gracefulShutdown = async (signal) => {
            logger_js_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
            server.close(async () => {
                logger_js_1.logger.info('HTTP server closed.');
                try {
                    await prisma_js_1.default.$disconnect();
                    logger_js_1.logger.info('Database disconnected.');
                    process.exit(0);
                }
                catch (error) {
                    logger_js_1.logger.error('Error during shutdown:', error);
                    process.exit(1);
                }
            });
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        logger_js_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map