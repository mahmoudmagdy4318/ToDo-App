"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = bootstrap;
const Container_js_1 = require("../container/Container.js");
const TaskService_js_1 = require("../../application/services/TaskService.js");
const TaskController_js_1 = require("../../presentation/controllers/TaskController.js");
const PrismaTaskRepository_js_1 = require("../repositories/PrismaTaskRepository.js");
const prisma_js_1 = __importDefault(require("../database/prisma.js"));
function bootstrap() {
    const container = new Container_js_1.Container();
    container.register('prismaClient', () => prisma_js_1.default, true);
    container.register('taskRepository', () => new PrismaTaskRepository_js_1.PrismaTaskRepository(container.resolve('prismaClient')), true);
    container.register('taskService', () => new TaskService_js_1.TaskService(container.resolve('taskRepository')), true);
    container.register('taskController', () => new TaskController_js_1.TaskController(container.resolve('taskService')), true);
    return container;
}
//# sourceMappingURL=bootstrap.js.map