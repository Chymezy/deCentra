import FeedSection from '@/components/home/FeedSection';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock backend and types
jest.mock('../../../../declarations/deCentra_backend', () => ({
  deCentra_backend: {
    getFeed: jest.fn(),
    createPost: jest.fn(),
    likePost: jest.fn(),
    getComments: jest.fn(),
    addComment: jest.fn(),
  },
}));

import { deCentra_backend } from '../../../../declarations/deCentra_backend';

describe('FeedSection', () => {
  const defaultProps = {
    isAuthenticated: false,
    principal: null,
    login: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    render(<FeedSection {...defaultProps} />);
    expect(screen.getByText(/Loading feed/i)).toBeInTheDocument();
  });

  it('shows backend error if backend is unavailable', async () => {
    (deCentra_backend.getFeed as unknown as jest.Mock).mockImplementation(
      () => {
        throw new Error('fail');
      },
    );
    render(<FeedSection {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Connection Error/i)).toBeInTheDocument();
      // Accept any error message in the error box
      expect(
        screen.getByText((content, node) => {
          return (
            typeof content === 'string' &&
            /Failed to load posts|Backend connection not available/i.test(
              content,
            )
          );
        }),
      ).toBeInTheDocument();
    });
  });

  it('shows authentication notice if not authenticated', async () => {
    (deCentra_backend.getFeed as unknown as jest.Mock).mockResolvedValue([]);
    render(<FeedSection {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome to deCentra/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Connect Internet Identity/i }),
      ).toBeInTheDocument();
    });
  });

  it('calls login when connect button is clicked', async () => {
    (deCentra_backend.getFeed as unknown as jest.Mock).mockResolvedValue([]);
    const login = jest.fn();
    render(<FeedSection {...defaultProps} login={login} />);
    await waitFor(() => {
      fireEvent.click(
        screen.getByRole('button', { name: /Connect Internet Identity/i }),
      );
      expect(login).toHaveBeenCalled();
    });
  });

  it('shows empty state if no posts', async () => {
    (deCentra_backend.getFeed as unknown as jest.Mock).mockResolvedValue([]);
    render(
      <FeedSection
        {...defaultProps}
        isAuthenticated={true}
        principal={'abcd-1234'}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText(/No posts yet/i)).toBeInTheDocument();
    });
  });

  it('renders posts and allows liking', async () => {
    (deCentra_backend.getFeed as unknown as jest.Mock).mockResolvedValue([
      {
        post: {
          id: 1n,
          content: 'Hello world',
          likes: 2n,
          comments: 1n,
          createdAt: Date.now(),
        },
        author: { username: 'alice', avatar: '👤' },
      },
    ]);
    (deCentra_backend.likePost as unknown as jest.Mock).mockResolvedValue({
      ok: true,
    });
    render(
      <FeedSection
        {...defaultProps}
        isAuthenticated={true}
        principal={'abcd-1234'}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument();
      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
    const likeButton = screen.getByText('❤️').closest('button');
    expect(likeButton).not.toBeNull();
    if (likeButton) {
      fireEvent.click(likeButton);
    }
    await waitFor(() => {
      expect(deCentra_backend.likePost).toHaveBeenCalled();
    });
  });

  it('shows and toggles comments section', async () => {
    (deCentra_backend.getFeed as unknown as jest.Mock).mockResolvedValue([
      {
        post: {
          id: 1n,
          content: 'Test post',
          likes: 0n,
          comments: 0n,
          createdAt: Date.now(),
        },
        author: { username: 'bob', avatar: '👤' },
      },
    ]);
    (deCentra_backend.getComments as unknown as jest.Mock).mockResolvedValue(
      [],
    );
    render(
      <FeedSection
        {...defaultProps}
        isAuthenticated={true}
        principal={'abcd-1234'}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Test post')).toBeInTheDocument();
    });
    const commentButton = screen.getByText('💬').closest('button');
    expect(commentButton).not.toBeNull();
    if (commentButton) {
      fireEvent.click(commentButton);
    }
    await waitFor(() => {
      expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
    });
  });

  it('allows creating a post', async () => {
    (deCentra_backend.getFeed as unknown as jest.Mock).mockResolvedValue([]);
    (deCentra_backend.createPost as unknown as jest.Mock).mockResolvedValue({
      ok: true,
    });
    render(
      <FeedSection
        {...defaultProps}
        isAuthenticated={true}
        principal={'abcd-1234'}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText(/Share Your Thoughts/i)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText(/what's on your mind/i), {
      target: { value: 'New post' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Post/i }));
    await waitFor(() => {
      expect(deCentra_backend.createPost).toHaveBeenCalledWith('New post');
    });
  });

  it('allows adding a comment', async () => {
    (deCentra_backend.getFeed as unknown as jest.Mock).mockResolvedValue([
      {
        post: {
          id: 1n,
          content: 'Test post',
          likes: 0n,
          comments: 0n,
          createdAt: Date.now(),
        },
        author: { username: 'bob', avatar: '👤' },
      },
    ]);
    (deCentra_backend.getComments as unknown as jest.Mock).mockResolvedValue(
      [],
    );
    (deCentra_backend.addComment as unknown as jest.Mock).mockResolvedValue({
      ok: true,
    });
    render(
      <FeedSection
        {...defaultProps}
        isAuthenticated={true}
        principal={'abcd-1234'}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Test post')).toBeInTheDocument();
    });
    const commentBtn = screen.getByText('💬').closest('button');
    expect(commentBtn).not.toBeNull();
    if (commentBtn) {
      fireEvent.click(commentBtn);
    }
    await waitFor(() => {
      expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText(/add a comment/i), {
      target: { value: 'Nice!' },
    });
    // Disambiguate Post button: the last one is for the comment
    const postButtons = screen.getAllByRole('button', { name: /^Post$/i });
    expect(postButtons.length).toBeGreaterThan(1);
    fireEvent.click(postButtons[postButtons.length - 1]);
    await waitFor(() => {
      expect(deCentra_backend.addComment).toHaveBeenCalledWith(1n, 'Nice!');
    });
  });
});
