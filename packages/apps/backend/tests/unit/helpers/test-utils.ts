import { Test, type TestingModule } from '@nestjs/testing';
import { type ValidationError } from 'class-validator';

export async function createTestModule(
  moduleMetadata: Parameters<typeof Test.createTestingModule>[0],
): Promise<TestingModule> {
  return Test.createTestingModule(moduleMetadata).compile();
}

export const getValidationErrorMessages = (errors: ValidationError[]): string[] =>
  errors.flatMap((error) => {
    const messages = error.constraints ? Object.values(error.constraints) : [];
    if (error.children && error.children.length > 0) {
      messages.push(...getValidationErrorMessages(error.children));
    }
    return messages;
  });
