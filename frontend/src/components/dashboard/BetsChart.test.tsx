import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { BetsChart } from './BetsChart';

test.each([{ won: 0, lost: 4 }, { won: 8, lost: 0 }, { won: 0, lost: 0 }])(
  'keeps readable counts when a category is zero: %j', (statistics) => {
    render(<BetsChart statistics={statistics} />);
    expect(screen.getByRole('heading', { name: 'Resultados de apuestas' })).toBeVisible();
    const entries = screen.getAllByRole('listitem');
    expect(entries[0]).toHaveTextContent(`Ganadas: ${statistics.won}`);
    expect(entries[1]).toHaveTextContent(`Perdidas: ${statistics.lost}`);
    expect(screen.getByText(`${statistics.won + statistics.lost} apuestas simuladas en total`)).toBeVisible();
    if (statistics.won + statistics.lost === 0) {
      expect(screen.getByText('Sin apuestas para mostrar.')).toBeVisible();
    }
  },
);
