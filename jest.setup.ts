import '@testing-library/jest-dom';

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: jest.fn().mockResolvedValue(undefined) },
  writable: true,
  configurable: true,
});

global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
global.URL.revokeObjectURL = jest.fn();
