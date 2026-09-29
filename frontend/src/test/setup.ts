import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { webcrypto } from 'node:crypto';

// jsdom no incluye SubtleCrypto: usamos SHA-256 real de Node, sin simular el hash.
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });

afterEach(cleanup);
