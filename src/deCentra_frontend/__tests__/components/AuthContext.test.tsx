import { AuthContext } from '@/components/AuthContext';
import Header from '@/components/Header';
import { jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
interface User {
  name?: string;
  id?: string;
}
type MockAuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  principal: string | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
};
const getMockAuthValue = (
  overrides: Partial<MockAuthContextType> = {},
): MockAuthContextType => ({
  isAuthenticated: false,
  user: null,
  principal: null,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  ...overrides,
});

describe('Header', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading skeleton when loading', () => {
    const mockValue = getMockAuthValue({ loading: true });
    render(
      <AuthContext.Provider value={mockValue}>
        <Header />
      </AuthContext.Provider>,
    );
    expect(screen.getByText('DC')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders public nav items and connect button when not authenticated', () => {
    const mockValue = getMockAuthValue({
      isAuthenticated: false,
      loading: false,
    });
    render(
      <AuthContext.Provider value={mockValue}>
        <Header />
      </AuthContext.Provider>,
    );
    [
      'Explore',
      'Features',
      'Build',
      'Learn',
      'Feed',
      'Profile',
      'GitHub',
    ].forEach((item) =>
      expect(screen.getByRole('link', { name: item })).toBeInTheDocument(),
    );
    const connectBtn = screen.getByRole('button', {
      name: /connect internet identity/i,
    });
    expect(connectBtn).toBeInTheDocument();
  });

  it('renders authenticated nav items, avatar, and logout when authenticated', () => {
    const fakePrincipal = 'abcd-efgh-ijkl-mnop';
    const logoutMock = jest.fn();
    const mockValue = getMockAuthValue({
      isAuthenticated: true,
      principal: fakePrincipal,
      loading: false,
      logout: logoutMock,
    });
    render(
      <AuthContext.Provider value={mockValue}>
        <Header />
      </AuthContext.Provider>,
    );
    ['Feed', 'Profile', 'Logout'].forEach((item) =>
      expect(screen.getByRole('link', { name: item })).toBeInTheDocument(),
    );
    expect(screen.getByText(/abcd\.{2,}/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Logout' }));
    expect(logoutMock).toHaveBeenCalled();
  });

  it('toggles the mobile menu when hamburger clicked', () => {
    const mockValue = getMockAuthValue({
      isAuthenticated: false,
      loading: false,
    });
    render(
      <AuthContext.Provider value={mockValue}>
        <Header />
      </AuthContext.Provider>,
    );
    const toggle = screen.getByLabelText(/toggle mobile menu/i);
    const before = screen.getAllByText('Explore').length;
    fireEvent.click(toggle);
    const after = screen.getAllByText('Explore').length;
    expect(after).toBeGreaterThan(before);
    fireEvent.click(toggle);
    const final = screen.getAllByText('Explore').length;
    expect(final).toBe(before);
  });
});
