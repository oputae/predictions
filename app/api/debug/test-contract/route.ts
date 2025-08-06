import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';

// Define baseSepolia chain since it's not exported from viem/chains
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
};

export async function GET() {
  try {
    const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID;
    const contractAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS;
    const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
    
    if (!alchemyId || !contractAddress || !usdcAddress) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        hasAlchemyId: !!alchemyId,
        hasContractAddress: !!contractAddress,
        hasUsdcAddress: !!usdcAddress
      }, { status: 500 });
    }

    // Create client
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(`https://base-sepolia.g.alchemy.com/v2/${alchemyId}`)
    });

    // Test 1: Get latest block
    const blockNumber = await client.getBlockNumber();
    
    // Test 2: Check contract bytecode
    const contractBytecode = await client.getBytecode({ address: contractAddress as `0x${string}` });
    
    // Test 3: Check USDC bytecode
    const usdcBytecode = await client.getBytecode({ address: usdcAddress as `0x${string}` });

    return NextResponse.json({
      success: true,
      blockNumber: blockNumber.toString(),
      contractAddress,
      contractHasBytecode: !!contractBytecode,
      usdcAddress,
      usdcHasBytecode: !!usdcBytecode,
      alchemyId: alchemyId.substring(0, 10) + '...'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Contract test failed', 
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 