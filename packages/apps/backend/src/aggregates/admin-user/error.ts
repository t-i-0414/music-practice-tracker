export const AdminUserErrorCodeRecord = {
  NOT_FOUND: 'AdminUser not found',
  ALREADY_EXISTS: 'AdminUser already exists',
  INVALID_DATA: 'Invalid AdminUser data',
} as const;

export class AdminUserError extends Error {
  public constructor(
    public readonly code: keyof typeof AdminUserErrorCodeRecord,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AdminUserError';
  }
}
