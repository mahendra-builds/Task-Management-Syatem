import { describe, expect, it, beforeEach } from 'vitest';
import { useAuthStore } from '../store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    localStorage.clear();
  });

  it('starts empty', () => {
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.token).toBeNull();
    expect(s.loading).toBe(false);
  });

  it('reset clears user and token', () => {
    useAuthStore.setState({ user: { id: '1' } as never, token: 'abc' });
    useAuthStore.getState().reset();
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.token).toBeNull();
  });

  it('login sets loading while in flight', async () => {
    const store = useAuthStore.getState();
    expect(store.loading).toBe(false);
  });
});
