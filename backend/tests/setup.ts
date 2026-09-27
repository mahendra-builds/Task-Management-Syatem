process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'mysql://test:test@localhost:3306/task_management_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-must-be-at-least-32-chars-long-xxx';
process.env.NODE_ENV = 'test';
