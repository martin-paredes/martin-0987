import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test('renders the initial application', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'Full-Stack App', level: 1 })).toBeVisible();
  expect(screen.getByText('Entorno inicial listo para desarrollar.')).toBeVisible();
});
