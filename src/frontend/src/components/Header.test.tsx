import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';

// Mock useAuth from AuthContext
jest.mock('./AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = require('./AuthContext').useAuth;

describe('Header', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      principal: null,
      loading: true,
      login: jest.fn(),
      logout: jest.fn(),
    });
    render(<Header />);
    expect(screen.getByText('deCentra')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('DC')).toBeInTheDocument();
  });

  it('renders public navigation and login button when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      principal: null,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
    render(<Header />);
    expect(screen.getByText('deCentra')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Connect Internet Identity')).toBeInTheDocument();
  });

  it('calls login when Connect Internet Identity button is clicked', () => {
    const loginMock = jest.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      principal: null,
      loading: false,
      login: loginMock,
      logout: jest.fn(),
    });
    render(<Header />);
    fireEvent.click(screen.getByText('Connect Internet Identity'));
    expect(loginMock).toHaveBeenCalled();
  });

  it('renders authenticated navigation and logout button', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      principal: 'abcd-1234',
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
    render(<Header />);
    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getAllByText('Logout')[0]).toBeInTheDocument();
    expect(screen.getByText('abcd...')).toBeInTheDocument();
  });

  it('calls logout when Logout button is clicked', () => {
    const logoutMock = jest.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      principal: 'abcd-1234',
      loading: false,
      login: jest.fn(),
      logout: logoutMock,
    });
    render(<Header />);
    fireEvent.click(screen.getAllByText('Logout')[0]);
    expect(logoutMock).toHaveBeenCalled();
  });
}); 