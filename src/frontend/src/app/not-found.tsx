import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-indigo to-electric-blue flex items-center justify-center px-6">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-6xl font-bold text-white mb-4">404</div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Page Not Found
          </h1>
          <p className="text-xl text-white/80 mb-8">
            The page you&apos;re looking for doesn&apos;t exist on deCentra.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-white text-deep-indigo px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            Return Home
          </Link>

          <div className="flex justify-center space-x-4 text-white/60">
            <Link href="/feed" className="hover:text-white transition-colors">
              Feed
            </Link>
            <span>•</span>
            <Link
              href="/profile"
              className="hover:text-white transition-colors"
            >
              Profile
            </Link>
            <span>•</span>
            <Link
              href="/discover"
              className="hover:text-white transition-colors"
            >
              Discover
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
