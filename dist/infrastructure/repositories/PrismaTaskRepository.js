"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTaskRepository = void 0;
const Task_js_1 = require("../../domain/entities/Task.js");
class PrismaTaskRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        const prismaTask = await this.db.task.findFirst({
            where: {
                id,
                deletedAt: null
            }
        });
        return prismaTask ? this.mapPrismaToEntity(prismaTask) : null;
    }
    async findMany(filters) {
        const where = this.buildWhereClause(filters, { excludeSearch: true });
        const isPrioritySort = filters.sortBy === 'priority';
        const dbQuery = { where };
        if (!isPrioritySort) {
            dbQuery.orderBy = this.buildOrderBy(filters);
        }
        dbQuery.skip = (filters.page - 1) * filters.limit;
        dbQuery.take = filters.limit;
        const prismaTasks = await this.db.task.findMany(dbQuery);
        let tasks = prismaTasks.map((task) => this.mapPrismaToEntity(task));
        if (filters.search) {
            const q = filters.search.toLowerCase();
            tasks = tasks.filter((t) => {
                const title = (t.title || '').toLowerCase();
                const desc = (t.description || '').toLowerCase();
                const tagsStr = (t.tags || []).join(',').toLowerCase();
                return title.includes(q) || desc.includes(q) || tagsStr.includes(q);
            });
        }
        const sortBy = filters.sortBy;
        const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
        tasks.sort((a, b) => {
            const dir = sortOrder;
            if (sortBy === 'priority') {
                const rank = {
                    HIGH: 2,
                    MEDIUM: 1,
                    LOW: 0,
                };
                const ra = rank[a.priority];
                const rb = rank[b.priority];
                return (ra - rb) * dir;
            }
            const av = a[sortBy];
            const bv = b[sortBy];
            const aVal = av instanceof Date ? av.getTime() : av;
            const bVal = bv instanceof Date ? bv.getTime() : bv;
            if (aVal < bVal)
                return -1 * dir;
            if (aVal > bVal)
                return 1 * dir;
            return 0;
        });
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        return tasks.slice(start, end);
    }
    async count(filters) {
        const where = this.buildWhereClause(filters, { excludeSearch: true });
        return await this.db.task.count({ where });
    }
    async create(task) {
        const prismaTask = await this.db.task.create({
            data: this.mapEntityToPrisma(task)
        });
        return this.mapPrismaToEntity(prismaTask);
    }
    async update(id, task) {
        const prismaTask = await this.db.task.update({
            where: { id },
            data: this.mapEntityToPrisma(task)
        });
        return this.mapPrismaToEntity(prismaTask);
    }
    async delete(id) {
        await this.db.task.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                updatedAt: new Date()
            }
        });
    }
    async findDeleted(filters) {
        const { status: _omit, ...rest } = filters;
        const where = this.buildWhereClause({ ...rest }, { excludeSearch: true });
        where.deletedAt = { not: null };
        const dbQuery = { where, orderBy: { deletedAt: 'desc' }, skip: (filters.page - 1) * filters.limit, take: filters.limit };
        const prismaTasks = await this.db.task.findMany(dbQuery);
        let tasks = prismaTasks.map((task) => this.mapPrismaToEntity(task));
        if (rest.search) {
            const q = rest.search.toLowerCase();
            tasks = tasks.filter((t) => {
                const title = (t.title || '').toLowerCase();
                const desc = (t.description || '').toLowerCase();
                const tagsStr = (t.tags || []).join(',').toLowerCase();
                return title.includes(q) || desc.includes(q) || tagsStr.includes(q);
            });
        }
        tasks.sort((a, b) => {
            const aVal = a.deletedAt ? a.deletedAt.getTime() : 0;
            const bVal = b.deletedAt ? b.deletedAt.getTime() : 0;
            return bVal - aVal;
        });
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        return tasks.slice(start, end);
    }
    async restore(id) {
        const prismaTask = await this.db.task.update({
            where: { id },
            data: {
                deletedAt: null,
                updatedAt: new Date()
            }
        });
        return this.mapPrismaToEntity(prismaTask);
    }
    buildWhereClause(filters, options) {
        const where = {
            deletedAt: null
        };
        if (filters.search && !options?.excludeSearch) {
            where.OR = [
                { title: { contains: filters.search } },
                { description: { contains: filters.search } },
                { tags: { contains: filters.search } }
            ];
        }
        if (filters.priority) {
            where.priority = filters.priority;
        }
        if (filters.status === 'completed') {
            where.completed = true;
        }
        else if (filters.status === 'incomplete') {
            where.completed = false;
        }
        if (filters.dueDate) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            switch (filters.dueDate) {
                case 'overdue':
                    where.dueDate = { lt: today };
                    where.completed = false;
                    break;
                case 'today':
                    where.dueDate = { gte: today, lt: tomorrow };
                    break;
                case 'week':
                    where.dueDate = { gte: today, lt: weekFromNow };
                    break;
                case 'none':
                    where.dueDate = null;
                    break;
            }
        }
        if (filters.tags && filters.tags.length > 0) {
            where.AND = filters.tags.map(tag => ({
                tags: { contains: tag }
            }));
        }
        return where;
    }
    buildOrderBy(filters) {
        const { sortBy, sortOrder } = filters;
        return {
            [sortBy]: sortOrder
        };
    }
    mapPrismaToEntity(prismaTask) {
        const tags = prismaTask.tags ? JSON.parse(prismaTask.tags) : [];
        return new Task_js_1.Task(prismaTask.id, prismaTask.title, prismaTask.description, prismaTask.priority, prismaTask.completed, prismaTask.dueDate, Array.isArray(tags) ? tags : [], prismaTask.createdAt, prismaTask.updatedAt, prismaTask.deletedAt, prismaTask.version);
    }
    mapEntityToPrisma(task) {
        return {
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            completed: task.completed,
            dueDate: task.dueDate,
            tags: JSON.stringify(task.tags),
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            deletedAt: task.deletedAt,
            version: task.version
        };
    }
}
exports.PrismaTaskRepository = PrismaTaskRepository;
//# sourceMappingURL=PrismaTaskRepository.js.map