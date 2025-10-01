// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock ESM-only modules so CRA/Jest 27 can run tests without ESM transform
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: () => null
}));

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => null
}));
