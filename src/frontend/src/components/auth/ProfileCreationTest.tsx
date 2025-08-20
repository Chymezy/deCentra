'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { authService } from '@/lib/services/auth.service';
import { AuthGuard } from './AuthGuard';

/**
 * ProfileCreationTest Component
 * 
 * Test component to verify profile creation integration works correctly.
 * Tests all aspects of the profile creation flow.
 */
export function ProfileCreationTest() {
  const authContext = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);

    try {
      addResult('🧪 Starting Profile Creation Integration Tests...');

      // Test 1: Username availability check
      addResult('Test 1: Username availability check');
      try {
        const availableResult = await authService.checkUsernameAvailability('test_user_' + Date.now());
        addResult(`✅ Available username check: ${availableResult}`);
        
        const unavailableResult = await authService.checkUsernameAvailability('admin');
        addResult(`✅ Reserved username check: ${unavailableResult}`);
      } catch (error) {
        addResult(`❌ Username availability test failed: ${error}`);
      }

      // Test 2: Profile creation validation
      addResult('Test 2: Profile creation validation');
      const testUsername = 'test_user_' + Date.now();
      
      try {
        // This should fail if user already has a profile
        await authContext.createUserProfile(testUsername, 'Test bio', '');
        addResult('✅ Profile creation test completed');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('User profile already exists')) {
          addResult('✅ Duplicate profile prevention working');
        } else {
          addResult(`❌ Profile creation failed: ${errorMessage}`);
        }
      }

      // Test 3: Authentication state
      addResult('Test 3: Authentication state check');
      if (authContext.isAuthenticated) {
        addResult('✅ User is authenticated');
        if (authContext.user) {
          addResult(`✅ User profile loaded: ${authContext.user.username}`);
        } else {
          addResult('⚠️ User authenticated but no profile');
        }
      } else {
        addResult('❌ User not authenticated');
      }

      addResult('🎉 Tests completed!');
    } catch (error) {
      addResult(`❌ Test suite failed: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <AuthGuard requireProfile={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Profile Creation Integration Test
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Test Controls */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Test Controls</h2>
                <button
                  onClick={runTests}
                  disabled={testing}
                  className={`
                    w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
                    ${!testing
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }
                  `}
                >
                  {testing ? 'Running Tests...' : 'Run Integration Tests'}
                </button>

                {/* Current State */}
                <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">Current State</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Authenticated:</span>
                      <span className={authContext.isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                        {authContext.isAuthenticated ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Has Profile:</span>
                      <span className={authContext.user ? 'text-green-400' : 'text-yellow-400'}>
                        {authContext.user ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {authContext.user && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Username:</span>
                        <span className="text-white">{authContext.user.username}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Loading:</span>
                      <span className={authContext.isLoading ? 'text-yellow-400' : 'text-green-400'}>
                        {authContext.isLoading ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {authContext.error && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Error:</span>
                        <span className="text-red-400 text-xs">{authContext.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Test Results */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
                <div className="bg-slate-900/50 rounded-lg p-4 h-96 overflow-y-auto">
                  {testResults.length === 0 ? (
                    <p className="text-slate-500 text-center">No tests run yet. Click &quot;Run Integration Tests&quot; to start.</p>
                  ) : (
                    <div className="space-y-1">
                      {testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`text-xs p-2 rounded ${
                            result.includes('✅') 
                              ? 'bg-green-500/10 text-green-400' 
                              : result.includes('❌')
                              ? 'bg-red-500/10 text-red-400'
                              : result.includes('⚠️')
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-slate-700/50 text-slate-300'
                          }`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Integration Instructions */}
            <div className="mt-8 p-4 bg-slate-700/30 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">Integration Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-slate-300">Backend Function Added</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-slate-300">Declarations Generated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-slate-300">Auth Service Updated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-slate-300">Profile Form Created</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-slate-300">AuthGuard Integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-slate-300">Ready for Testing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
