'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

interface NavItem {
  name: string;
  href: string;
  external?: boolean;
  action?: string;
}

export default function Header() {
  const { isAuthenticated, principal, isLoading, login, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const publicNavItems: NavItem[] = [
    { name: 'Explore', href: '#explore' },
    { name: 'Features', href: '#features' },
    { name: 'Build', href: '#build' },
    { name: 'Learn', href: '#learn' },
    { name: 'Feed', href: '/feed' },
    { name: 'Profile', href: '/profile' },
    { name: 'GitHub', href: 'https://github.com', external: true },
  ];

  const authenticatedNavItems: NavItem[] = [
    { name: 'Feed', href: '/feed' },
    { name: 'Profile', href: '/profile' },
    { name: 'Logout', href: '#logout', action: 'logout' },
  ];

  const handleLogout = () => {
    logout();
  };

  const handleNavClick = (item: NavItem) => {
    if (item.action === 'logout') {
      handleLogout();
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-gray/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-electric-blue rounded-lg flex items-center justify-center animate-pulse">
                <span className="text-white font-code font-bold text-sm">
                  DC
                </span>
              </div>
              <span className="text-white font-heading font-bold text-xl">
                deCentra
              </span>
            </div>
            <div className="w-8 h-4 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-gray/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-electric-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-code font-bold text-sm">DC</span>
            </div>
            <Link
              href="/"
              className="text-white font-heading font-bold text-xl"
            >
              deCentra
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                {authenticatedNavItems.map((item) =>
                  item.href.startsWith('/') ? (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => handleNavClick(item)}
                      className="text-white/80 hover:text-electric-blue font-body font-medium transition-colors"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => handleNavClick(item)}
                      className="text-white/80 hover:text-electric-blue font-body font-medium transition-colors"
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                    >
                      {item.name}
                    </a>
                  )
                )}
                {/* User Avatar */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-electric-blue to-vibrant-orange rounded-full flex items-center justify-center">
                    <span className="text-white font-code font-bold text-sm">
                      {principal
                        ? String(principal).substring(0, 4) + '...'
                        : 'U'}
                    </span>
                  </div>
                </div>
                <button className="btn-primary ml-4" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                {publicNavItems.map((item) =>
                  item.href.startsWith('/') ? (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-white/80 hover:text-electric-blue font-body font-medium transition-colors"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        if (!item.external) {
                          scrollToSection(item.href);
                        }
                      }}
                      className="text-white/80 hover:text-electric-blue font-body font-medium transition-colors"
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                    >
                      {item.name}
                    </a>
                  )
                )}
                <button className="btn-primary" onClick={() => login()}>
                  Connect Internet Identity
                </button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white/80 hover:text-electric-blue p-2"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-dark-gray border-t border-white/10">
              {isAuthenticated
                ? authenticatedNavItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => handleNavClick(item)}
                      className="block px-3 py-2 text-white/80 hover:text-electric-blue font-body font-medium"
                    >
                      {item.name}
                    </Link>
                  ))
                : publicNavItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-3 py-2 text-white/80 hover:text-electric-blue font-body font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
              {!isAuthenticated && (
                <button onClick={() => login()} className="w-full mt-4 btn-primary">
                  Connect Internet Identity
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
