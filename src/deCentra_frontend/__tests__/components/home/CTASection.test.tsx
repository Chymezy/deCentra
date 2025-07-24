import CTASection from '@/components/home/CTASection';
import { fireEvent, render, screen } from '@testing-library/react';

describe('CTASection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders main heading and description', () => {
    render(<CTASection />);
    expect(screen.getByText(/Ready to Build the Future/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Join thousands of creators, developers, and communities/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders primary CTA buttons', () => {
    render(<CTASection />);
    expect(
      screen.getByRole('button', { name: /Start Building/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Explore Platform/i }),
    ).toBeInTheDocument();
  });

  it('scrolls to feed section when Start Building is clicked', () => {
    render(<CTASection />);
    const feedDiv = document.createElement('div');
    feedDiv.id = 'feed';
    document.body.appendChild(feedDiv);
    const scrollIntoView = jest.fn();
    feedDiv.scrollIntoView = scrollIntoView;
    fireEvent.click(screen.getByRole('button', { name: /Start Building/i }));
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('scrolls to features section when Explore Platform is clicked', () => {
    render(<CTASection />);
    const featuresDiv = document.createElement('div');
    featuresDiv.id = 'features';
    document.body.appendChild(featuresDiv);
    const scrollIntoView = jest.fn();
    featuresDiv.scrollIntoView = scrollIntoView;
    fireEvent.click(screen.getByRole('button', { name: /Explore Platform/i }));
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('renders user type CTAs and triggers alerts', () => {
    render(<CTASection />);
    // Developer
    window.alert = jest.fn();
    fireEvent.click(screen.getByRole('button', { name: /View APIs/i }));
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringMatching(/Developer APIs coming soon/i),
    );
    // Creator
    fireEvent.click(screen.getByRole('button', { name: /Start Creating/i }));
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringMatching(/Creator monetization features coming in Phase 2/i),
    );
    // Organization
    fireEvent.click(screen.getByRole('button', { name: /Contact Sales/i }));
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringMatching(/Enterprise solutions coming soon/i),
    );
  });

  it('renders platform features preview', () => {
    render(<CTASection />);
    ['Posts & Feed', 'Comments & Likes', 'Tokenization', 'Identity'].forEach(
      (feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      },
    );
    ['📝', '💬', '🪙', '🔐'].forEach((icon) => {
      expect(screen.getByText(icon)).toBeInTheDocument();
    });
  });

  it('renders trust indicators', () => {
    render(<CTASection />);
    [
      '🔓 Open Source',
      '🌍 Censorship Resistant',
      '💰 Creator Monetization',
      '⚡ Built on ICP',
      '🔒 Zero Platform Fees',
    ].forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
});
