import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Spinner, EmptyState, ErrorState } from '../components/Feedback';

describe('Feedback components', () => {
  it('Spinner renders with role=status', () => {
    render(<Spinner label="Loading data" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading data')).toHaveClass('sr-only');
  });

  it('EmptyState shows icon, title, description, and action', () => {
    render(
      <EmptyState
        icon="📦"
        title="Nothing here"
        description="Try creating something"
        action={<button>Add</button>}
      />,
    );
    expect(screen.getByText('📦')).toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Try creating something')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('ErrorState shows the message and retry button when provided', () => {
    const onRetry = () => {};
    render(<ErrorState message="Boom" onRetry={onRetry} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Boom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('EmptyState without action renders without button', () => {
    render(
      <MemoryRouter>
        <EmptyState title="Empty" />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});
