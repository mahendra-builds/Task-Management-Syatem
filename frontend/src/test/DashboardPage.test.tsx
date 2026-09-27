import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';

describe('DashboardPage', () => {
  it('renders dashboard heading and 5 stat cards', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/total tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });
});
