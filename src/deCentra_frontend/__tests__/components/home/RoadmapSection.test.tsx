import RoadmapSection from '@/components/home/RoadmapSection';
import { render, screen } from '@testing-library/react';

describe('RoadmapSection', () => {
  it('renders the main section and title', () => {
    render(<RoadmapSection />);
    // Remove ambiguous region role assertion, just check for the heading
    expect(screen.getByText(/Platform Evolution/i)).toBeInTheDocument();
  });

  it('renders all roadmap phases with correct titles and features', () => {
    render(<RoadmapSection />);
    expect(screen.getByText(/Core Platform/i)).toBeInTheDocument();
    expect(screen.getByText(/Monetization & Governance/i)).toBeInTheDocument();
    expect(screen.getByText(/Global Scale/i)).toBeInTheDocument();

    // Check for features in each phase
    [
      'Profiles & posts fully on-chain',
      'Internet Identity authentication',
      'Basic feed & like functionality',
      'Deployed to ICP mainnet',
      'Micro-tipping system',
      'Creator marketplace',
      'DAO moderation',
      'Whistleblower tools',
      'Regional hubs',
      'Mobile apps',
      'Enterprise tools',
      'NGO partnerships',
    ].forEach((feature) => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  it('renders phase status and timeline', () => {
    render(<RoadmapSection />);
    expect(screen.getByText(/In Development/i)).toBeInTheDocument();
    expect(screen.getByText(/Q1 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/Q2 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/Q3-Q4 2025/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Planned/i).length).toBeGreaterThanOrEqual(2);
  });

  it('renders market opportunity metrics and icons', () => {
    render(<RoadmapSection />);
    expect(screen.getByText('3.3B')).toBeInTheDocument();
    expect(screen.getByText('$104B')).toBeInTheDocument();
    expect(screen.getByText('10K+')).toBeInTheDocument();
    expect(screen.getByText('$35B')).toBeInTheDocument();
    expect(screen.getAllByText('🌏').length).toBeGreaterThanOrEqual(1);
    // "🎥" appears in both Market Opportunity and Strategic Focus Areas
    expect(screen.getAllByText('🎥').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('📰').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('💰').length).toBeGreaterThanOrEqual(1);
  });

  it('renders strategic focus areas and their icons', () => {
    render(<RoadmapSection />);
    expect(screen.getByText(/Developer Ecosystem/i)).toBeInTheDocument();
    // "Creator Economy" appears as both a heading and a metric, so use getAllByText
    expect(
      screen.getAllByText(/Creator Economy/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Enterprise Solutions/i)).toBeInTheDocument();
    expect(screen.getAllByText('👨‍💻').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('🎥').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('🏢').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all section headings', () => {
    render(<RoadmapSection />);
    expect(screen.getByText(/Market Opportunity/i)).toBeInTheDocument();
    expect(screen.getByText(/Strategic Focus Areas/i)).toBeInTheDocument();
  });

  it('renders correct number of phases and market data cards', () => {
    render(<RoadmapSection />);
    // 3 phases
    expect(
      screen.getAllByRole('heading', { level: 3 }).length,
    ).toBeGreaterThanOrEqual(4); // 3 phases + Market Opportunity
    // 4 market data cards
    expect(
      screen.getAllByText(
        /Users in censored regions|Global creator economy|NGOs & watchdogs|Decentralized social TAM/i,
      ).length,
    ).toBe(4);
  });
});
