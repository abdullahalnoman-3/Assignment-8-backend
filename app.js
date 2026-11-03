import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Polyfill for @mongodb-js/saslprep (resolves cPanel zip extraction issues with scoped @ folders)
try {
  require('@mongodb-js/saslprep');
} catch (e) {
  const Module = require('module');
  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === '@mongodb-js/saslprep') {
      const fn = (input) => (typeof input === 'string' ? input.normalize('NFKC') : input);
      fn.saslprep = fn;
      fn.default = fn;
      return fn;
    }
    return originalLoad.apply(this, arguments);
  };
}

import './src/server.js';
