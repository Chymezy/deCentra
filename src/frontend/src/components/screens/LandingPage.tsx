'use client';

import { useState } from 'react';
import { ArrowRight, Github, Twitter, ChevronDown, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function LandingPage() {
  const { 
    isAuthenticated, 
    isLoading: authLoading, 
    login, 
    logout,
    error: authError,
    clearAuthError,
    privacyMode 
  } = useAuth();
  
  const [selectedPrivacyMode, setSelectedPrivacyMode] = useState<'normal' | 'anonymous' | 'whistleblower'>('normal');
  const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);

  const handleLogin = async () => {
    try {
      clearAuthError?.(); // Clear any previous errors
      await login(selectedPrivacyMode);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const privacyModeOptions = [
    {
      id: 'normal' as const,
      title: 'Standard Mode',
      description: 'Regular social networking with full features',
      icon: '🌟',
      recommended: true
    },
    {
      id: 'anonymous' as const,
      title: 'Anonymous Mode',
      description: 'Browse and post without revealing identity',
      icon: '👤',
      recommended: false
    },
    {
      id: 'whistleblower' as const,
      title: 'Whistleblower Mode',
      description: 'Maximum security for sensitive information',
      icon: '🛡️',
      recommended: false
    }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" variant="glass-primary" />
          <div className="text-gray-300">
            {privacyMode === 'whistleblower' ? 'Establishing secure connection...' :
             privacyMode === 'anonymous' ? 'Connecting anonymously...' :
             'Connecting to deCentra...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-900/8 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-1/3 w-64 h-64 bg-orange-900/6 rounded-full blur-3xl"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image
                  src="/images/decentra-logo.png"
                  alt="deCentra Logo"
                  width={32}
                  height={32}
                  className="rounded-lg shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-indigo-500/20 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                deCentra
              </span>
            </Link>

            <div className="flex items-center space-x-6">
              <Link
                href="/about"
                className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium relative group"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link href="/feed">
                    <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25">
                      Go to Feed
                    </button>
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        await logout();
                      } catch (error) {
                        console.error('Logout failed:', error);
                      }
                    }}
                    className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  {/* Privacy Mode Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowPrivacyOptions(!showPrivacyOptions)}
                      className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 px-3 py-2 rounded-lg text-sm transition-all duration-300"
                    >
                      <span>{privacyModeOptions.find(m => m.id === selectedPrivacyMode)?.icon}</span>
                      <span className="text-gray-300">
                        {privacyModeOptions.find(m => m.id === selectedPrivacyMode)?.title}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {showPrivacyOptions && (
                      <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50">
                        {privacyModeOptions.map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => {
                              setSelectedPrivacyMode(mode.id);
                              setShowPrivacyOptions(false);
                            }}
                            className={`w-full p-4 text-left hover:bg-gray-800/50 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl ${
                              selectedPrivacyMode === mode.id ? 'bg-indigo-900/30 border-l-2 border-indigo-500' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-xl">{mode.icon}</span>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-white">{mode.title}</h4>
                                  {mode.recommended && (
                                    <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                                      Recommended
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{mode.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleLogin}
                    disabled={authLoading}
                    className={`bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25 flex items-center space-x-2 ${
                      authError ? 'ring-2 ring-red-500/50' : ''
                    }`}
                  >
                    {authLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>
                          {selectedPrivacyMode === 'whistleblower' ? 'Securing connection...' :
                           selectedPrivacyMode === 'anonymous' ? 'Connecting anonymously...' :
                           'Connecting...'}
                        </span>
                      </>
                    ) : (
                      <span>
                        {selectedPrivacyMode === 'whistleblower' ? 'Secure Login' :
                         selectedPrivacyMode === 'anonymous' ? 'Anonymous Login' :
                         'Sign in with Internet Identity'}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Authentication Error Banner */}
      {authError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-auto px-6">
          <div className="bg-red-900/90 backdrop-blur-xl border border-red-800/50 rounded-xl p-4 shadow-2xl animate-slide-down">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-red-100">Authentication Error</h4>
                <p className="text-sm text-red-200 mt-1 break-words">{authError}</p>
              </div>
              <button
                onClick={() => clearAuthError?.()}
                className="text-red-400 hover:text-red-300 transition-colors duration-200 flex-shrink-0"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20 relative">
        <div className="max-w-5xl mx-auto text-center space-y-16 relative z-10">
          {/* Main Headline */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-gray-900/50 border border-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm font-medium">
                Built on Internet Computer
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tight">
              <span className="block text-white">Social media</span>
              <span className="block bg-gradient-to-r from-indigo-400 via-blue-400 to-orange-400 bg-clip-text text-transparent">
                without limits
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
              Share your thoughts freely. Connect authentically.
              <br />
              <span className="text-gray-300">
                Own your digital identity completely.
              </span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up animation-delay-500">
            {!isAuthenticated ? (
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={handleLogin}
                  disabled={authLoading}
                  className={`group relative bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 hover:from-indigo-700 hover:via-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-indigo-500/25 overflow-hidden ${
                    authError ? 'ring-2 ring-red-500/50' : ''
                  }`}
                >
                  <span className="relative z-10 flex items-center">
                    {authLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                        {selectedPrivacyMode === 'whistleblower' ? 'Securing...' :
                         selectedPrivacyMode === 'anonymous' ? 'Connecting anonymously...' :
                         'Connecting...'}
                      </>
                    ) : (
                      <>
                        {selectedPrivacyMode === 'whistleblower' ? 'Join Securely' :
                         selectedPrivacyMode === 'anonymous' ? 'Join Anonymously' :
                         'Join deCentra'}
                        <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                </button>
                
                {/* Privacy Mode Indicator */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <span>{privacyModeOptions.find(m => m.id === selectedPrivacyMode)?.icon}</span>
                    <span>{privacyModeOptions.find(m => m.id === selectedPrivacyMode)?.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    {privacyModeOptions.find(m => m.id === selectedPrivacyMode)?.description}
                  </p>
                </div>
                
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-all duration-300 text-lg font-light group relative"
                >
                  <span className="border-b border-gray-600 group-hover:border-gray-400 pb-1 transition-colors duration-300">
                    Learn more
                  </span>
                </Link>
              </div>
            ) : (
              <Link href="/feed">
                <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-10 py-4 rounded-2xl text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center">
                  Go to Feed
                  <ArrowRight className="ml-3 h-5 w-5" />
                </button>
              </Link>
            )}
          </div>

          {/* Scroll Indicator */}
          <div className="pt-20 animate-fade-in-up animation-delay-1000">
            <div className="flex flex-col items-center space-y-3 text-gray-500">
              <span className="text-xs font-light tracking-widest uppercase">
                Scroll to explore
              </span>
              <ChevronDown className="h-4 w-4 animate-bounce opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in-left">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-6xl font-black leading-tight">
                  Your voice,
                  <br />
                  <span className="text-gray-500">uncensored</span>
                </h2>
                <p className="text-lg text-gray-400 leading-relaxed font-light max-w-lg">
                  Traditional platforms decide what you can say and who can hear
                  it. We believe in a different approach—one where communities
                  govern themselves and your content truly belongs to you.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/about"
                  className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-all duration-300 font-medium group"
                >
                  <span className="border-b border-indigo-500/50 group-hover:border-indigo-400 pb-1">
                    Discover how it works
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative animate-fade-in-right animation-delay-300">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 rounded-3xl p-8 border border-gray-800/50 backdrop-blur-sm shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 rounded-full border border-indigo-500/30"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full w-28"></div>
                      <div className="h-2 bg-gray-800 rounded-full w-20"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full w-full"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full w-4/5"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full w-3/4"></div>
                  </div>
                  <div className="flex items-center space-x-8 pt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-indigo-600/30 to-blue-600/30 rounded border border-indigo-500/40"></div>
                      <div className="h-2 bg-gray-800 rounded-full w-10"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-blue-600/30 to-orange-600/30 rounded border border-blue-500/40"></div>
                      <div className="h-2 bg-gray-800 rounded-full w-10"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-orange-600/30 to-indigo-600/30 rounded border border-orange-500/40"></div>
                      <div className="h-2 bg-gray-800 rounded-full w-8"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-blue-600/5 rounded-3xl blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Second Value Prop */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            {/* Left Visual */}
            <div className="lg:order-1 order-2 relative animate-fade-in-left animation-delay-300">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 rounded-3xl p-8 border border-gray-800/50 backdrop-blur-sm shadow-2xl">
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full w-40 mx-auto"></div>
                    <div className="h-2 bg-gray-800 rounded-full w-28 mx-auto"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 space-y-3 border border-gray-700/30">
                      <div className="h-2 bg-gradient-to-r from-indigo-600/40 to-blue-600/40 rounded-full w-full"></div>
                      <div className="h-8 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-lg w-16 border border-indigo-500/30"></div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 space-y-3 border border-gray-700/30">
                      <div className="h-2 bg-gradient-to-r from-blue-600/40 to-orange-600/40 rounded-full w-full"></div>
                      <div className="h-8 bg-gradient-to-r from-blue-600/20 to-orange-600/20 rounded-lg w-16 border border-blue-500/30"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-orange-600/5 rounded-3xl blur-xl"></div>
            </div>

            {/* Right Content */}
            <div className="lg:order-2 order-1 space-y-8 animate-fade-in-right">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-6xl font-black leading-tight">
                  Built for
                  <br />
                  <span className="text-gray-500">creators</span>
                </h2>
                <p className="text-lg text-gray-400 leading-relaxed font-light max-w-lg">
                  Monetize your content directly without platform fees. Connect
                  with your audience through tips, subscriptions, and community
                  governance. Your creativity, your rules.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/about"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-all duration-300 font-medium group"
                >
                  <span className="border-b border-blue-500/50 group-hover:border-blue-400 pb-1">
                    Explore creator tools
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center space-y-16">
          <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-5xl md:text-7xl font-black leading-tight">
              Ready to own
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-orange-400 bg-clip-text text-transparent">
                your digital life?
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              Join thousands who&apos;ve already made the switch to truly
              decentralized social media.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up animation-delay-500">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={handleLogin}
                  className="group relative bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 hover:from-indigo-700 hover:via-blue-700 hover:to-blue-800 text-white px-10 py-4 rounded-2xl text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-indigo-500/25 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Get started
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                </button>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-all duration-300 text-lg font-light group relative"
                >
                  <span className="border-b border-gray-600 group-hover:border-gray-400 pb-1 transition-colors duration-300">
                    Learn more about deCentra
                  </span>
                </Link>
              </>
            ) : (
              <Link href="/feed">
                <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-10 py-4 rounded-2xl text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center">
                  Go to Feed
                  <ArrowRight className="ml-3 h-5 w-5" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-16 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <Image
                  src="/images/decentra-logo.png"
                  alt="deCentra Logo"
                  width={24}
                  height={24}
                  className="rounded-lg group-hover:shadow-indigo-500/25 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-indigo-500/20 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <span className="text-sm font-medium text-gray-300">
                deCentra
              </span>
            </div>

            <div className="flex items-center space-x-8">
              <Link
                href="/about"
                className="text-gray-500 hover:text-gray-300 transition-colors text-sm font-light"
              >
                About
              </Link>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-300 transition-colors text-sm font-light"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-300 transition-colors text-sm font-light"
              >
                Terms
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="text-gray-500 hover:text-indigo-400 transition-colors transform hover:scale-110"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-blue-400 transition-colors transform hover:scale-110"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800/30 text-center">
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              © 2025 deCentra. Built on Internet Computer Protocol.
              <br />
              <span className="text-gray-700 mt-1 block">
                Decentralized • Open Source • Community Owned
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
