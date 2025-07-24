import ProblemSection from '@/components/home/ProblemSection';
import { fireEvent, render, screen } from '@testing-library/react';

describe('ProblemSection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders main heading and description', () => {
    render(<ProblemSection />);
    expect(screen.getByText(/Why deCentra is Different/i)).toBeInTheDocument();
    expect(
      screen.getByText(/foundation for digital freedom/i),
    ).toBeInTheDocument();
  });

  it('renders all challenge cards with icons, titles, descriptions, and highlights', () => {
    render(<ProblemSection />);
    [
      {
        icon: '🔐',
        title: 'Data Ownership',
        desc: 'Your content, your rules. No more algorithms deciding what you see or who sees you.',
        highlight: 'Complete data sovereignty',
      },
      {
        icon: '💎',
        title: 'Direct Monetization',
        desc: 'Keep 100% of your earnings. No platform fees, no intermediaries taking cuts.',
        highlight: 'Zero platform fees',
      },
      {
        icon: '🌍',
        title: 'Global Reach',
        desc: 'Access from anywhere, anytime. No regional restrictions or content blocking.',
        highlight: 'Borderless connectivity',
      },
    ].forEach(({ icon, title, desc, highlight }) => {
      expect(screen.getByText(icon)).toBeInTheDocument();
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(desc)).toBeInTheDocument();
      expect(screen.getByText(highlight)).toBeInTheDocument();
    });
  });

  it('renders value proposition section', () => {
    render(<ProblemSection />);
    expect(
      screen.getByText(/Built for the Future of Social Media/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Join thousands of creators, activists, and communities/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Join the Movement/i }),
    ).toBeInTheDocument();
  });

  it('scrolls to feed section when Join the Movement is clicked', () => {
    render(<ProblemSection />);
    const feedDiv = document.createElement('div');
    feedDiv.id = 'feed';
    document.body.appendChild(feedDiv);
    const scrollIntoView = jest.fn();
    feedDiv.scrollIntoView = scrollIntoView;
    fireEvent.click(screen.getByRole('button', { name: /Join the Movement/i }));
    expect(scrollIntoView).toHaveBeenCalled();
  });
});
