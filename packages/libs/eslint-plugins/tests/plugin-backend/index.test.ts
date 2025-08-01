import { describe, expect, it } from 'vitest';

import pluginBackend from '@/plugin-backend';

describe('plugin-backend', () => {
  it('should export plugin with correct structure', () => {
    expect(pluginBackend).toBeDefined();
    expect(pluginBackend).toHaveProperty('meta');
    expect(pluginBackend).toHaveProperty('rules');
  });

  it('should have correct meta information', () => {
    expect(pluginBackend.meta).toEqual({
      name: '@music-practice-tracker/eslint-plugin-backend',
      version: '1.0.0',
    });
  });

  it('should export all rules', () => {
    const expectedRules = [
      'no-internal-id',
      'prisma-naming-convention',
      'prisma-repository-only-access',
      'repository-model-access-restriction',
    ];

    expectedRules.forEach((ruleName) => {
      expect(pluginBackend.rules).toHaveProperty(ruleName);
    });

    // Check that there are exactly 4 rules
    expect(Object.keys(pluginBackend.rules)).toHaveLength(4);
  });

  it('should have valid rule objects', () => {
    Object.entries(pluginBackend.rules).forEach(([ruleName, rule]) => {
      expect(rule).toBeDefined();
      expect(rule).toHaveProperty('meta');
      expect(rule).toHaveProperty('create');
      expect(typeof rule.create).toBe('function');
      expect(rule.meta).toHaveProperty('type');
      expect(rule.meta).toHaveProperty('docs');
      expect(rule.meta).toHaveProperty('messages');
      expect(rule.meta).toHaveProperty('schema');
    });
  });

  it('should have correct rule types', () => {
    expect(pluginBackend.rules['no-internal-id'].meta.type).toBe('problem');
    expect(pluginBackend.rules['prisma-naming-convention'].meta.type).toBe('problem');
    expect(pluginBackend.rules['prisma-repository-only-access'].meta.type).toBe('problem');
    expect(pluginBackend.rules['repository-model-access-restriction'].meta.type).toBe('problem');
  });

  it('should have descriptions for all rules', () => {
    Object.values(pluginBackend.rules).forEach((rule) => {
      expect(rule.meta.docs).toHaveProperty('description');
      expect(typeof rule.meta.docs.description).toBe('string');
      expect(rule.meta.docs.description.length).toBeGreaterThan(0);
    });
  });

  it('should have messages for all rules', () => {
    Object.values(pluginBackend.rules).forEach((rule) => {
      expect(rule.meta.messages).toBeDefined();
      expect(typeof rule.meta.messages).toBe('object');
      expect(Object.keys(rule.meta.messages).length).toBeGreaterThan(0);
    });
  });

  it('should have schema for all rules', () => {
    Object.values(pluginBackend.rules).forEach((rule) => {
      expect(rule.meta.schema).toBeDefined();
      expect(Array.isArray(rule.meta.schema)).toBe(true);
    });
  });
});