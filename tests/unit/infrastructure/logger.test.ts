import { describe, it, expect } from 'vitest';
import { logger } from '../../../src/infrastructure/logging/logger.js';

describe('Infrastructure - logger', () => {
  it('has transports configured', () => {
    // winston logger exposes transports array
    expect(Array.isArray((logger as any).transports)).toBe(true);
    expect((logger as any).transports.length).toBeGreaterThan(0);
  });

  it('supports info/error logging without throwing', () => {
    expect(() => logger.info('test info', { a: 1 })).not.toThrow();
    expect(() => logger.error('test error', { e: new Error('x') })).not.toThrow();
  });
});
