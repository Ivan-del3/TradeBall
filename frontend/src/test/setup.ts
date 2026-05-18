import '@testing-library/jest-dom'

declare module 'vitest' {
  interface Assertion<R> extends jest.Matchers<R> {}
  interface AsymmetricMatchersContaining extends jest.Matchers<void> {}
}
