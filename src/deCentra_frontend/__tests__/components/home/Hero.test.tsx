import Hero from '@/components/home/Hero';
import { fireEvent, render, screen } from '@testing-library/react';

describe('Hero', () => {
  beforeEach(() => {
    // Clean up any added elements
    document.body.innerHTML = '';
  });

  it('renders main headline and value proposition', () => {
    render(<Hero />);
    expect(screen.getByText(/Own Your/i)).toBeInTheDocument();
    expect(screen.getByText(/Digital Identity/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /The first truly decentralized social platform where you control your data/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders social proof icons and text', () => {
    render(<Hero />);
    expect(screen.getByText('🌐')).toBeInTheDocument();
    expect(screen.getByText('Global accessibility')).toBeInTheDocument();
    expect(screen.getByText('🔒')).toBeInTheDocument();
    expect(screen.getByText('Zero censorship')).toBeInTheDocument();
    expect(screen.getByText('💰')).toBeInTheDocument();
    expect(screen.getByText('Direct monetization')).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<Hero />);
    expect(
      screen.getByRole('button', { name: /Start Building/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Explore Platform/i }),
    ).toBeInTheDocument();
  });

  it('scrolls to feed section when Start Building is clicked', () => {
    render(<Hero />);
    const feedDiv = document.createElement('div');
    feedDiv.id = 'feed';
    document.body.appendChild(feedDiv);
    const scrollIntoView = jest.fn();
    feedDiv.scrollIntoView = scrollIntoView;
    fireEvent.click(screen.getByRole('button', { name: /Start Building/i }));
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('scrolls to features section when Explore Platform is clicked', () => {
    render(<Hero />);
    const featuresDiv = document.createElement('div');
    featuresDiv.id = 'features';
    document.body.appendChild(featuresDiv);
    const scrollIntoView = jest.fn();
    featuresDiv.scrollIntoView = scrollIntoView;
    fireEvent.click(screen.getByRole('button', { name: /Explore Platform/i }));
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('renders network of people nodes and labels', () => {
    render(<Hero />);
    ['Creator', 'Developer', 'Community', 'Activist', 'Investor'].forEach(
      (label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      },
    );
    expect(screen.getAllByText('👤').length).toBe(5);
  });

  it('renders Power to the People section', () => {
    render(<Hero />);
    expect(screen.getByText(/Power to the People/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Connected. Empowered. Uncensored./i),
    ).toBeInTheDocument();
  });

  it('renders trust indicators', () => {
    render(<Hero />);
    [
      '🔓 Open Source',
      '🌍 Censorship Resistant',
      '💰 Creator Monetization',
      '⚡ Built on ICP',
    ].forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
});
