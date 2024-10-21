import { join } from 'path';
import { readFileAsynchronously, doStuffByTimeout, doStuffByInterval } from '.';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

jest.mock('path', () => {
  const originalModule = jest.requireActual<typeof import('path')>('path');
  return {
    __esModule: true,
    ...originalModule,
    join: jest.fn(),
  };
});

jest.mock('fs/promises', () => {
  const originalModule =
    jest.requireActual<typeof import('fs/promises')>('fs/promises');
  return {
    __esModule: true,
    ...originalModule,
    readFile: jest.fn(),
  };
});

jest.mock('fs', () => {
  const originalModule = jest.requireActual<typeof import('fs')>('fs');
  return {
    __esModule: true,
    ...originalModule,
    existsSync: jest.fn(),
  };
});

describe('doStuffByTimeout function', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should initialize timeout without calling the callback immediately', () => {
    const mockCallback = jest.fn();
    doStuffByTimeout(mockCallback, 1000);
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('should trigger callback after the timeout period', () => {
    const mockCallback = jest.fn();
    doStuffByTimeout(mockCallback, 1000);
    expect(mockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(mockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});

describe('doStuffByInterval function', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should initialize interval without triggering the callback', () => {
    const mockCallback = jest.fn();
    doStuffByInterval(mockCallback, 1000);
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('should call the callback repeatedly after each interval', () => {
    const mockCallback = jest.fn();
    doStuffByInterval(mockCallback, 1000);
    expect(mockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(1000);
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });
});

describe('readFileAsynchronously function', () => {
  test('should use join to generate the full file path', async () => {
    (join as jest.Mock).mockReturnValue('pathToFile');
    const mockPath = 'text.txt';
    await readFileAsynchronously(mockPath);
    expect(join).toHaveBeenCalledWith(__dirname, mockPath);
  });

  test('should return null if file does not exist', async () => {
    (existsSync as jest.Mock).mockReturnValue(false);
    const mockPath = 'text.txt';
    const result = await readFileAsynchronously(mockPath);
    expect(result).toBeNull();
  });

  test('should return file content if file exists', async () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    (readFile as jest.Mock).mockResolvedValue('fileContent');
    const mockPath = 'text.txt';
    const result = await readFileAsynchronously(mockPath);
    expect(result).toBe('fileContent');
  });
});
