import { rm } from 'fs/promises';
import { join } from 'path';

global.beforeEach(async () => {
  try {
    await rm(join(__dirname, '..', 'test.sqlite'));
  } catch (error) {}

  // This is a global setup that runs before each test file.
  // jest.clearAllMocks();
  // jest.resetModules();
  // jest.restoreAllMocks();
  // jest.resetAllMocks();
  // jest.spyOn(console, 'error').mockImplementation(() => {});
  // jest.spyOn(console, 'warn').mockImplementation(() => {});
  // jest.spyOn(console, 'log').mockImplementation(() => {});
  // jest.spyOn(console, 'info').mockImplementation(() => {});
});
