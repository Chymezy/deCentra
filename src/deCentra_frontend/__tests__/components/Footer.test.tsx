import Footer from '@/components/Footer';
import { render, screen } from '@testing-library/react';

describe('Footer', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  it('renders a footer landmark', () => {
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('displays the brand logo and name', () => {
    expect(screen.getByText('DC')).toBeInTheDocument();
    expect(screen.getByText('deCentra')).toBeInTheDocument();
  });

  it('includes the correct number of social media links', () => {
    const githubLinks = screen.getAllByRole('link', { name: /github/i });
    expect(githubLinks.length).toBeGreaterThanOrEqual(2);
    const twitterLinks = screen.getAllByRole('link', { name: /twitter/i });
    expect(twitterLinks.length).toBeGreaterThanOrEqual(2);
    const discordLinks = screen.getAllByRole('link', { name: /discord/i });
    expect(discordLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('renders quick links under Platform and Community sections', () => {
    expect(
      screen.getByRole('heading', { name: /Platform/i }),
    ).toBeInTheDocument();
    // Platform links: filter by visible text only (not sr-only)
    const platformNames = ['Explore', 'Features', 'Build', 'Learn'];
    platformNames.forEach((name) => {
      const links = screen.getAllByText(name, { selector: 'a' });
      expect(links.length).toBe(1);
    });

    expect(
      screen.getByRole('heading', { name: /Community/i }),
    ).toBeInTheDocument();
    const communityNames = ['GitHub', 'Discord', 'Twitter', 'Blog'];
    communityNames.forEach((name) => {
      const links = screen.getAllByText(name, { selector: 'a' });
      expect(links.length).toBe(1);
    });
  });

  it('renders the bottom © notice', () => {
    expect(screen.getByText(/©\s*2025\s*deCentra\./i)).toBeInTheDocument();
  });
});
