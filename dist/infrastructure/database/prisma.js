"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_js_1 = require("../logging/logger.js");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
    ],
});
if (process.env.NODE_ENV === 'development') {
    exports.prisma.$on('query', (e) => {
        logger_js_1.logger.debug('Database Query', {
            query: e.query,
            params: e.params,
            duration: `${e.duration}ms`
        });
    });
}
exports.prisma.$on('error', (e) => {
    logger_js_1.logger.error('Database Error', { error: e });
});
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
process.on('beforeExit', async () => {
    await exports.prisma.$disconnect();
});
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map