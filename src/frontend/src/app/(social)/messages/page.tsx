'use client';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-dark-background-primary">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-2xl font-bold text-dark-text-primary mb-2">Messages</h1>
          <p className="text-dark-text-secondary mb-4">
            Secure, encrypted messaging coming soon
          </p>
          <p className="text-dark-text-tertiary text-sm">
            This feature will enable private communication between users with end-to-end encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
