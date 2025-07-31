'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { FarcasterUser } from '@/app/lib/types';

interface FarcasterContextType {
  user: FarcasterUser | null;
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
  loading: boolean;
}

const FarcasterContext = createContext<FarcasterContextType>({
  user: null,
  isAuthenticated: false,
  signIn: () => {},
  signOut: () => {},
  loading: false,
});

export const useFarcaster = () => useContext(FarcasterContext);

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = useCallback(async () => {
    setLoading(true);
    try {
      // In production, this would use @farcaster/auth-kit
      // For now, we'll simulate the auth flow
      
      // This is where you'd integrate the actual Farcaster auth
      // Example with auth-client:
      /*
      const authClient = new AuthClient({
        relay: 'https://relay.farcaster.xyz',
        rpcUrl: 'https://mainnet.optimism.io',
      });
      
      const channel = await authClient.createChannel({
        siweUri: 'https://your-app.com',
        domain: 'your-app.com',
      });
      
      // Open auth window
      window.open(channel.url, 'farcaster-auth', 'width=400,height=600');
      
      // Wait for auth completion
      const { fid, username, displayName, pfpUrl } = await authClient.watchStatus({
        channelToken: channel.channelToken,
        timeout: 300_000, // 5 minutes
      });
      */

      // Simulated auth for development
      const mockUser: FarcasterUser = {
        fid: 1234,
        username: 'testuser',
        displayName: 'Test User',
        pfpUrl: 'https://i.imgur.com/default.png',
      };

      // Save to session
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: mockUser }),
      });

      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Clear session
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  return (
    <FarcasterContext.Provider
      value={{
        user,
        isAuthenticated,
        signIn,
        signOut,
        loading,
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
}

// Optional: Export a component that requires Farcaster auth
export function RequireFarcaster({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useFarcaster();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Farcaster Authentication Required</h2>
          <p className="text-gray-400">Please sign in with Farcaster to continue</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}