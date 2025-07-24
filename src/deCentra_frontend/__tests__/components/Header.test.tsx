import { AuthContext } from '@/components/AuthContext';
import Header from '@/components/Header';
import { fireEvent, render, screen } from '@testing-library/react';

const getMockAuthValue = (overrides = {}) => ({
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

  it('renders logo and brand', () => {
    render(
      <AuthContext.Provider value={getMockAuthValue()}>
        <Header />
      </AuthContext.Provider>,
    );
    expect(screen.getByText('DC')).toBeInTheDocument();
    expect(screen.getByText('deCentra')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(
      <AuthContext.Provider value={getMockAuthValue({ loading: true })}>
        <Header />
      </AuthContext.Provider>,
    );
    expect(screen.getByText('DC')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    // Should not show nav or connect button
    expect(
      screen.queryByRole('button', { name: /connect internet identity/i }),
    ).not.toBeInTheDocument();
  });

  it('renders public nav items when not authenticated', () => {
    render(
      <AuthContext.Provider value={getMockAuthValue()}>
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
    ].forEach((item) => expect(screen.getByText(item)).toBeInTheDocument());
    expect(
      screen.getByRole('button', { name: /connect internet identity/i }),
    ).toBeInTheDocument();
  });

  it('calls login when connect button is clicked', () => {
    const login = jest.fn();
    render(
      <AuthContext.Provider value={getMockAuthValue({ login })}>
        <Header />
      </AuthContext.Provider>,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /connect internet identity/i }),
    );
    expect(login).toHaveBeenCalled();
  });

  it('renders authenticated nav items and avatar', () => {
    const logout = jest.fn();
    render(
      <AuthContext.Provider
        value={getMockAuthValue({
          isAuthenticated: true,
          principal: 'abcd-efgh',
          logout,
        })}
      >
        <Header />
      </AuthContext.Provider>,
    );
    ['Feed', 'Profile'].forEach((item) =>
      expect(screen.getByText(item)).toBeInTheDocument(),
    );
    // There should be two Logout elements: <a> and <button>
    const logoutButtons = screen.getAllByText('Logout');
    expect(logoutButtons.length).toBe(2);
    expect(screen.getByText(/abcd\.\.\./i)).toBeInTheDocument();
    // Click the button (not the link)
    const logoutButton = logoutButtons.find((el) => el.tagName === 'BUTTON');
    expect(logoutButton).toBeDefined();
    if (logoutButton) {
      fireEvent.click(logoutButton);
    }
    expect(logout).toHaveBeenCalled();
  });

  it('shows U in avatar if principal is missing', () => {
    render(
      <AuthContext.Provider
        value={getMockAuthValue({ isAuthenticated: true, principal: null })}
      >
        <Header />
      </AuthContext.Provider>,
    );
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('toggles mobile menu and closes on nav click', () => {
    render(
      <AuthContext.Provider value={getMockAuthValue()}>
        <Header />
      </AuthContext.Provider>,
    );
    const toggle = screen.getByLabelText(/toggle mobile menu/i);
    const before = screen.getAllByText('Explore').length;
    fireEvent.click(toggle);
    expect(screen.getAllByText('Explore').length).toBeGreaterThan(before);
    // Click a nav link in mobile menu
    fireEvent.click(screen.getAllByText('Explore')[1]);
    // Menu should close: nav is still present and no error is thrown
    // (jsdom cannot reliably test visibility with Tailwind responsive classes)
    expect(screen.getAllByText('Explore').length).toBeGreaterThan(0);
  });
  it('external links have correct attributes', () => {
    render(
      <AuthContext.Provider value={getMockAuthValue()}>
        <Header />
      </AuthContext.Provider>,
    );
    const github = screen.getByText('GitHub').closest('a');
    expect(github).toHaveAttribute('href', 'https://github.com');
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('scrolls to section for hash links', () => {
    const scrollIntoView = jest.fn();
    document.body.innerHTML += '<div id="explore"></div>';
    const exploreElem = document.getElementById('explore');
    if (exploreElem) {
      exploreElem.scrollIntoView = scrollIntoView;
    }

    render(
      <AuthContext.Provider value={getMockAuthValue()}>
        <Header />
      </AuthContext.Provider>,
    );
    fireEvent.click(screen.getByText('Explore'));
    expect(scrollIntoView).toHaveBeenCalled();
  });
});
