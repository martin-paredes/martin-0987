import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { createElement } from 'react';
import type { ResponsiveContainerProps } from 'recharts';

// jsdom no incluye SubtleCrypto: usamos SHA-256 real de Node, sin simular el hash.
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });

// jsdom no calcula layout ni incluye ResizeObserver. Solo fijamos el tamaño;
// las gráficas reales siguen renderizándose. El responsive se verifica en navegador.
vi.mock('recharts', async (importOriginal) => {
  const recharts = await importOriginal<typeof import('recharts')>();
  return {
    ...recharts,
    ResponsiveContainer: (props: ResponsiveContainerProps) =>
      createElement(recharts.ResponsiveContainer, { ...props, width: 480, height: 280 }),
  };
});

afterEach(cleanup);
