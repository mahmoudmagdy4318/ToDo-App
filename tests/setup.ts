import { beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: 'file:./test.db'
});

beforeAll(async () => {
  // Initialize test database
  try {
    await prisma.$connect();
    console.log('Test database connected');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
});

afterAll(async () => {
  // Cleanup test database
  try {
    await prisma.task.deleteMany();
    await prisma.$disconnect();
    console.log('Test database cleaned up');
  } catch (error: any) {
    // Ignore missing table errors to avoid noisy teardown failures
    if (error?.code === 'P2021') {
      console.warn('Skipping cleanup: tasks table does not exist in test database');
      try {
        await prisma.$disconnect();
      } catch {}
    } else {
      console.error('Failed to cleanup test database:', error);
      try {
        await prisma.$disconnect();
      } catch {}
    }
  }
});

// Global test utilities
global.testUtils = {
  async createTestTask(data = {}) {
    return await prisma.task.create({
      data: {
        id: `test-${Date.now()}-${Math.random()}`,
        title: 'Test Task',
        priority: 'MEDIUM',
        completed: false,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        ...data
      }
    });
  },

  async cleanupTasks() {
    try {
      await prisma.task.deleteMany();
    } catch (error: any) {
      if (error?.code === 'P2021') {
        console.warn('Skipping cleanupTasks: tasks table does not exist in test database');
      } else {
        throw error;
      }
    }
  }
};

export { prisma };
