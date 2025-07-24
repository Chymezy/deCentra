/* eslint-disable @typescript-eslint/no-require-imports */
// jest.setup.js
require('@testing-library/jest-dom');

// Polyfill Node’s TextEncoder/TextDecoder for packages (like @dfinity/agent)
const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
