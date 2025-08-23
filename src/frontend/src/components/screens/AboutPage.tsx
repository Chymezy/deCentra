'use client';

import type React from 'react';

import { useState } from 'react';
import {
  Shield,
  Globe,
  Users,
  Zap,
  ArrowRight,
  Github,
  Twitter,
  CheckCircle,
  TrendingUp,
  Lock,
  Coins,
  MessageCircle,
  Heart,
  Share2,
  Star,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  const handleLogin = () => {
    // Mock authentication - replace with real auth logic
    setIsAuthenticated(true);
  };

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Censorship Resistant',
      description:
        "Your voice can't be silenced by governments or corporations. Built on immutable blockchain infrastructure.",
      color: 'indigo',
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Truly Decentralized',
      description:
        'No central authority. You own your data, identity, and digital presence completely.',
      color: 'blue',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Community Governed',
      description:
        'Democratic moderation through decentralized voting. The community decides the rules.',
      color: 'indigo',
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Creator Economy',
      description:
        'Direct monetization with crypto payments. No platform fees, no middlemen.',
      color: 'blue',
    },
  ];

  const stats = [
    { number: '100%', label: 'Decentralized', color: 'text-indigo-400' },
    { number: '0%', label: 'Platform Fees', color: 'text-blue-400' },
    { number: '∞', label: 'Uptime', color: 'text-indigo-400' },
    { number: '24/7', label: 'Censorship Free', color: 'text-blue-400' },
  ];

  const problemStats = [
    {
      number: '3.3B',
      label: 'People in censored regions',
      icon: <Lock className="h-10 w-10" />,
      color: 'indigo',
    },
    {
      number: '45+',
      label: 'Countries with internet censorship',
      icon: <Globe className="h-10 w-10" />,
      color: 'blue',
    },
    {
      number: '$104B',
      label: 'Creator economy controlled by platforms',
      icon: <TrendingUp className="h-10 w-10" />,
      color: 'orange',
    },
  ];

  const communityStats = [
    {
      icon: <Users className="h-10 w-10" />,
      label: 'Growing Community',
      value: 'Join Us',
      color: 'indigo',
    },
    {
      icon: <Github className="h-10 w-10" />,
      label: 'Open Source',
      value: '100%',
      color: 'blue',
    },
    {
      icon: <Shield className="h-10 w-10" />,
      label: 'Uptime',
      value: '24/7',
      color: 'indigo',
    },
    {
      icon: <Star className="h-10 w-10" />,
      label: 'Platform Fees',
      value: '0%',
      color: 'blue',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-900/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-900/6 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-1/3 w-64 h-64 bg-orange-900/4 rounded-full blur-3xl"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-indigo-500/10 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <Image
                    src="/images/decentra-logo.png"
                    alt="deCentra Logo"
                    width={40}
                    height={40}
                    className="rounded-xl shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <span className="text-3xl font-bold text-white">deCentra</span>
              </Link>

              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="text-sm font-medium">Back to Home</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link href="/feed">
                  <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25">
                    Go to Feed
                  </button>
                </Link>
              ) : (
                <button
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8 animate-fade-in-left">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-gray-900/50 border border-indigo-500/20 px-6 py-3 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-indigo-300 font-medium">
                    🚀 Built on Internet Computer Protocol
                  </span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tight">
                  <span className="block text-indigo-400 animate-fade-in">
                    Social
                  </span>
                  <span className="block text-blue-400 animate-fade-in animation-delay-300">
                    Freedom
                  </span>
                  <span className="block text-white animate-fade-in animation-delay-500">
                    Unleashed
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl animate-fade-in-up animation-delay-700">
                  Break free from censorship. Own your data. Build communities
                  without boundaries.
                  <span className="text-indigo-400 font-semibold">
                    {' '}
                    The revolution starts here.
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-1000">
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={handleLogin}
                      className="group relative bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-indigo-500/25 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Join the Revolution
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                    <button className="group border-2 border-gray-600 hover:border-indigo-500 text-gray-300 hover:text-white px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm hover:bg-indigo-500/10">
                      <Github className="mr-2 h-5 w-5 inline group-hover:rotate-12 transition-transform" />
                      View Source
                    </button>
                  </>
                ) : (
                  <Link href="/feed">
                    <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl">
                      Go to Feed
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 animate-fade-in-up animation-delay-1200">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center group cursor-pointer">
                    <div
                      className={`text-3xl md:text-4xl font-black ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                    >
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Interactive Demo */}
            <div className="relative animate-fade-in-right animation-delay-500">
              <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
                {/* Subtle border glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-transparent rounded-3xl blur opacity-50"></div>

                <div className="relative z-10 space-y-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-3xl font-bold text-indigo-400">
                      Experience True Freedom
                    </h3>
                    <p className="text-gray-300">
                      Join the decentralized revolution
                    </p>
                  </div>

                  {/* Mock Social Feed Preview */}
                  <div className="space-y-4 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">A</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full blur opacity-30 animate-pulse"></div>
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          Anonymous Whistleblower
                        </div>
                        <div className="text-sm text-gray-400">
                          @truth_seeker • 2m
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-200 leading-relaxed">
                      Finally, a platform where I can share important
                      information without fear of censorship. The decentralized
                      architecture gives me confidence that my voice will be
                      heard. 🔒✨
                    </p>

                    <div className="flex items-center space-x-6 text-gray-400">
                      <div className="flex items-center space-x-2 hover:text-red-400 transition-colors cursor-pointer">
                        <Heart className="h-5 w-5" />
                        <span>1.2k</span>
                      </div>
                      <div className="flex items-center space-x-2 hover:text-blue-400 transition-colors cursor-pointer">
                        <MessageCircle className="h-5 w-5" />
                        <span>89</span>
                      </div>
                      <div className="flex items-center space-x-2 hover:text-indigo-400 transition-colors cursor-pointer">
                        <Share2 className="h-5 w-5" />
                        <span>234</span>
                      </div>
                      <div className="flex items-center space-x-2 text-orange-400">
                        <Coins className="h-5 w-5" />
                        <span>5.2 ICP</span>
                      </div>
                    </div>
                  </div>

                  {!isAuthenticated && (
                    <div className="space-y-4">
                      <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-14 text-lg px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
                          required
                        />
                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white h-14 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center"
                          disabled={isSubmitted}
                        >
                          {isSubmitted ? (
                            <>
                              <CheckCircle className="mr-2 h-5 w-5" />
                              Thanks! We&apos;ll be in touch
                            </>
                          ) : (
                            'Get Early Access'
                          )}
                        </button>
                      </form>

                      <div className="text-center">
                        <span className="text-gray-500 text-sm">or</span>
                      </div>

                      <button
                        onClick={handleLogin}
                        className="w-full border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white h-14 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                      >
                        Sign in with Internet Identity
                      </button>
                    </div>
                  )}

                  <div className="text-center text-xs text-gray-500">
                    By joining, you agree to our decentralized terms of service
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 bg-gray-900/50 border border-indigo-500/20 px-6 py-3 rounded-full backdrop-blur-sm mb-6">
              <span className="text-indigo-300 font-medium">Why deCentra?</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Built for <span className="text-indigo-400">Freedom</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Traditional platforms control your data, censor your voice, and
              profit from your content. We&apos;re building something revolutionary.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group animate-fade-in-up hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="relative h-full bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                  {/* Color-specific glow on hover */}
                  <div
                    className={`absolute inset-0 ${
                      feature.color === 'indigo'
                        ? 'bg-indigo-500/10'
                        : feature.color === 'blue'
                          ? 'bg-blue-500/10'
                          : 'bg-orange-500/10'
                    } rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  ></div>

                  <div className="relative z-10 text-center">
                    <div
                      className={`w-20 h-20 ${
                        feature.color === 'indigo'
                          ? 'bg-indigo-600'
                          : feature.color === 'blue'
                            ? 'bg-blue-600'
                            : 'bg-orange-600'
                      } rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <h3
                      className={`text-2xl font-bold mb-4 ${
                        feature.color === 'indigo'
                          ? 'text-indigo-400'
                          : feature.color === 'blue'
                            ? 'text-blue-400'
                            : 'text-orange-400'
                      } group-hover:text-white transition-colors duration-300`}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/50 to-gray-950"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              The Problem is <span className="text-orange-400">Real</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Censorship and control over digital communication is rising
              globally
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {problemStats.map((stat, index) => (
              <div
                key={index}
                className="text-center group animate-scale-in hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div
                  className={`w-24 h-24 ${
                    stat.color === 'indigo'
                      ? 'bg-indigo-600'
                      : stat.color === 'blue'
                        ? 'bg-blue-600'
                        : 'bg-orange-600'
                  } rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-2xl transition-all duration-300`}
                >
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div
                  className={`text-5xl font-black mb-2 ${
                    stat.color === 'indigo'
                      ? 'text-indigo-400'
                      : stat.color === 'blue'
                        ? 'text-blue-400'
                        : 'text-orange-400'
                  } group-hover:scale-110 transition-transform duration-300`}
                >
                  {stat.number}
                </div>
                <div className="text-gray-300 group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Join the <span className="text-blue-400">Revolution</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Be part of building the future of social media. Decentralized,
              censorship-resistant, and community-owned.
            </p>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-indigo-500/25 flex items-center justify-center"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm flex items-center justify-center">
                  <Github className="mr-2 h-5 w-5" />
                  Contribute
                </button>
              </div>
            )}
          </div>

          {/* Community Stats */}
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {communityStats.map((item, index) => (
              <div
                key={index}
                className="text-center group animate-fade-in-up hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-20 h-20 ${
                    item.color === 'indigo' ? 'bg-indigo-600' : 'bg-blue-600'
                  } rounded-2xl shadow-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-3xl transition-all duration-300`}
                >
                  <div className="text-white">{item.icon}</div>
                </div>
                <div
                  className={`text-3xl font-black mb-1 ${
                    item.color === 'indigo'
                      ? 'text-indigo-400'
                      : 'text-blue-400'
                  } group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.value}
                </div>
                <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950/80 backdrop-blur-xl border-t border-gray-800/50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Image
                    src="/images/decentra-logo.png"
                    alt="deCentra Logo"
                    width={40}
                    height={40}
                    className="rounded-xl"
                  />
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur opacity-30 animate-pulse"></div>
                </div>
                <span className="text-3xl font-bold text-indigo-400">
                  deCentra
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The decentralized social network for a free and open internet.
                Built on Internet Computer Protocol.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg text-white">Platform</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link
                    href="/feed"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Feed
                  </Link>
                </li>
                <li>
                  <a
                    href="/creators"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Creators
                  </a>
                </li>
                <li>
                  <a
                    href="/dao"
                    className="hover:text-blue-400 transition-colors"
                  >
                    DAO
                  </a>
                </li>
                <li>
                  <a
                    href="/whistleblower"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Whistleblower
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg text-white">Resources</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Whitepaper
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg text-white">Community</h4>
              <div className="flex space-x-4 mb-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-indigo-400 transition-colors transform hover:scale-110"
                >
                  <Twitter className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition-colors transform hover:scale-110"
                >
                  <Github className="h-6 w-6" />
                </a>
              </div>
              <p className="text-gray-400 text-sm">
                Join our community of builders creating the future of social
                media.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 deCentra. Built on Internet Computer Protocol. Open
              source and decentralized.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
