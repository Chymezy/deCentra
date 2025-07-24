import FeaturesSection from '@/components/home/FeaturesSection';
import { render, screen } from '@testing-library/react';

describe('FeaturesSection', () => {
  it('renders main heading and description', () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/Platform Capabilities/i)).toBeInTheDocument();
    // There are multiple elements with this text, so use getAllByText
    expect(
      screen.getAllByText(
        /Built for the 3.3 billion users in censored regions/i,
      ).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders all feature cards with icons, titles, and descriptions', () => {
    render(<FeaturesSection />);
    [
      'Censorship Resistant',
      'DAO Governance',
      'Creator Monetization',
      'Anonymous Whistleblowing',
      'Global Accessibility',
      '100% On-Chain',
    ].forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
    ['🔒', '👥', '💰', '🕵️', '🌍', '⚡'].forEach((icon) => {
      expect(screen.getAllByText(icon).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders platform statistics', () => {
    render(<FeaturesSection />);
    ['99.9%', '0ms', '100%', '0%'].forEach((metric) => {
      expect(screen.getByText(metric)).toBeInTheDocument();
    });
    ['Uptime', 'Censorship', 'Data Ownership', 'Platform Fees'].forEach(
      (label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      },
    );
  });

  it('renders technical architecture and user benefits', () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/Technical Architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/User Benefits/i)).toBeInTheDocument();
    [
      'Fully decentralized on Internet Computer Protocol',
      'Zero single points of failure',
      'Cryptographic data integrity',
      'Cross-chain interoperability',
      'Complete data ownership and control',
      'Direct monetization without fees',
      'Global accessibility without restrictions',
      'Community-driven governance',
    ].forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });
});
