'use client';

import Header from '@/components/Header';
import FeedSection from '@/components/home/FeedSection';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import ProfileCreationWizard from '@/components/profile/ProfileCreationWizard';

export default function FeedPage() {
  const { isAuthenticated, principal, login, needsProfileCreation, isLoading } =
    useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Show profile creation wizard if user needs to create a profile
  if (isAuthenticated && needsProfileCreation) {
    return (
      <>
        <Header />
        <main className="pt-16">
          <ProfileCreationWizard
            onComplete={() => {
              // Profile creation completed, the context will automatically refresh
              // and needsProfileCreation will become false
              console.log('Profile creation completed');
            }}
          />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-16">
        <FeedSection
          isAuthenticated={isAuthenticated}
          principal={principal}
          login={login}
        />
        <Footer />
      </main>
    </>
  );
}
