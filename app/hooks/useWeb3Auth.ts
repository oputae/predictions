import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { useFarcaster } from '@/app/providers/FarcasterProvider';
import { useCallback, useEffect, useState } from 'react';
import { FarcasterUser } from '@/app/lib/types';

// Define Base chains locally since they're not exported in wagmi v0.12.19
const base = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
    public: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://basescan.org' },
  },
};

const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
};

interface Web3AuthState {
  // Wallet
  address?: string;
  isWalletConnected: boolean;
  isWalletConnecting: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  
  // Farcaster
  farcasterUser: FarcasterUser | null;
  isFarcasterAuthenticated: boolean;
  signInWithFarcaster: () => void;
  signOutFarcaster: () => void;
  
  // Network
  chain: any;
  isWrongNetwork: boolean;
  switchToBase: () => void;
  
  // Combined state
  isFullyAuthenticated: boolean;
  authLoading: boolean;
}

export function useWeb3Auth(): Web3AuthState {
  const { 
    address, 
    isConnected: isWalletConnected, 
    isConnecting: isWalletConnecting 
  } = useAccount();
  
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  
  const {
    user: farcasterUser,
    isAuthenticated: isFarcasterAuthenticated,
    signIn: signInWithFarcaster,
    signOut: signOutFarcaster,
    loading: farcasterLoading,
  } = useFarcaster();

  const [authLoading, setAuthLoading] = useState(true);

  // Check if on wrong network (not Base, Base Sepolia, or localhost)
  const isWrongNetwork = chain ? 
    chain.id !== base.id && chain.id !== baseSepolia.id && chain.id !== 31337 : 
    false;

  // Connect wallet function
  const connectWallet = useCallback(() => {
    const injectedConnector = connectors.find(c => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  }, [connectors, connect]);

  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // Switch to correct network
  const switchToBase = useCallback(() => {
    const network = process.env.NEXT_PUBLIC_NETWORK;
    let targetChainId;
    
    if (network === 'localhost') {
      targetChainId = 31337; // localhost
    } else if (network === 'base') {
      targetChainId = base.id;
    } else {
      targetChainId = baseSepolia.id; // default to base-sepolia
    }
    
    switchNetwork?.(targetChainId);
  }, [switchNetwork]);

  // Update loading state
  useEffect(() => {
    // Consider auth loading complete when Farcaster has loaded
    // and wallet connection state is determined
    setAuthLoading(farcasterLoading);
  }, [farcasterLoading]);

  // Save Farcaster session when authenticated
  useEffect(() => {
    const saveSession = async () => {
      if (isFarcasterAuthenticated && farcasterUser) {
        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: farcasterUser }),
          });
        } catch (error) {
          console.error('Failed to save session:', error);
        }
      }
    };

    saveSession();
  }, [isFarcasterAuthenticated, farcasterUser]);

  // Check if fully authenticated (both Farcaster and wallet connected on right network)
  const isFullyAuthenticated = 
    isWalletConnected && 
    isFarcasterAuthenticated && 
    !isWrongNetwork;

  return {
    // Wallet
    address,
    isWalletConnected,
    isWalletConnecting,
    connectWallet,
    disconnectWallet,
    
    // Farcaster
    farcasterUser,
    isFarcasterAuthenticated,
    signInWithFarcaster,
    signOutFarcaster,
    
    // Network
    chain,
    isWrongNetwork,
    switchToBase,
    
    // Combined
    isFullyAuthenticated,
    authLoading,
  };
}