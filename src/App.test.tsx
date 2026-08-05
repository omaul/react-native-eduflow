import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

it('renders brand link', () => {
  render(<App />);
  expect(screen.getByText(/Что-то где-то растёт/i)).toBeInTheDocument();
});
