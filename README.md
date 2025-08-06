# Farcaster Prediction Markets 🎯

A decentralized prediction market platform built for Farcaster, allowing users to bet on cryptocurrency price movements using USDC on Base.

## 🎬 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-repo/prediction-markets
cd prediction-markets

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Configuration section)

# Compile contracts and generate ABIs
npx hardhat compile

# Start local development
npx hardhat node                    # Terminal 1 - Local blockchain
npm run setup:local                 # Terminal 2 - Deploy contracts & generate ABIs
npm run dev                        # Terminal 2 - Start frontend
```

Visit http://localhost:3000

## 📋 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Prerequisites](#-prerequisites)
3. [Detailed Installation](#-detailed-installation-guide)
4. [Configuration](#-configuration)
5. [Development Workflow](#-development-workflow)
6. [Deployment](#-deployment)
7. [Testing](#-testing)
8. [File Structure & Descriptions](#-file-structure--descriptions)
9. [Troubleshooting](#-troubleshooting)

## 🏗️ Architecture Overview

### Why We Built It This Way

1. **Smart Contracts (Solidity)**
   - **Deadline-Based Resolution**: Markets resolve using Chainlink price at deadline, preventing manipulation
   - **Fair One-Sided Markets**: Users get their money back when no one bets on the opposing side
   - **USDC-based**: Real stablecoin instead of ETH for predictable betting
   - **1% Fee Model**: Only on profits, not on stakes - fair for users
   - **Chainlink Oracles**: Base Mainnet price feeds for reliable, real-time pricing
   - **Fee Management**: Admin can withdraw fees and forfeited amounts
   - **5-Minute Tolerance**: Strict accuracy requirements for price data

2. **Frontend (Next.js 14 + TypeScript)**
   - **App Router**: Latest Next.js patterns for better performance
   - **Server Components**: Where possible, for faster loads
   - **Wagmi + RainbowKit**: Best-in-class Web3 UX
   - **Smart Notifications**: Max 3 toasts, deduplication, dynamic durations
   - **Smart USDC Approval**: Skips approval if user already has sufficient allowance

3. **Farcaster Integration**
   - **Frames**: Bet directly in-feed without leaving Farcaster
   - **Native Auth**: Sign in with Farcaster identity
   - **Social Features**: Share markets as casts

### Tech Stack
- **Blockchain**: Base (Ethereum L2)
- **Smart Contracts**: Solidity 0.8.22, OpenZeppelin, Chainlink
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: Wagmi, Viem, RainbowKit
- **Auth**: Farcaster Auth Kit
- **Testing**: Hardhat, Chai
- **Price Feeds**: Base Mainnet Chainlink (CBBTC/USD, ETH/USD)

## 📚 Prerequisites

Before starting, ensure you have:

1. **Software**
   - Node.js 18+ ([Download](https://nodejs.org/))
   - Git ([Download](https://git-scm.com/))
   - VS Code or similar editor

2. **Accounts**
   - GitHub account
   - Alchemy account ([Sign up](https://alchemy.com/))
   - WalletConnect Cloud account ([Sign up](https://cloud.walletconnect.com/))
   - Basescan account ([Sign up](https://basescan.org/))
   - Farcaster account ([Sign up](https://warpcast.com/))

3. **Wallet**
   - MetaMask or similar Web3 wallet
   - Some Base Sepolia ETH ([Faucet](https://www.alchemy.com/faucets/base-sepolia))

## 🚀 Detailed Installation Guide

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-repo/prediction-markets
cd prediction-markets

# Install dependencies
npm install
```

### Step 2: Environment Setup

```bash
# Copy environment template
cp .env.example .env.local
```

Edit `.env.local` with your values:

```bash
# Network Configuration
NEXT_PUBLIC_NETWORK=base-sepolia
NEXT_PUBLIC_CHAIN_ID=84532

# Contract Addresses (current deployment)
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x93f0C0a18478Be1370224481155D21D974C95234
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# API Keys (required)
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id_here
ALCHEMY_API_KEY=your_alchemy_key_here
BASESCAN_API_KEY=your_basescan_key_here

# Farcaster (optional for now)
FARCASTER_CLIENT_ID=your_farcaster_app_id
FARCASTER_CLIENT_SECRET=your_farcaster_secret

# App URL
NEXT_PUBLIC_URL=http://localhost:3000

# Private Keys (never commit!)
PRIVATE_KEY=your_wallet_private_key_here
JWT_SECRET=any_random_string_here
```

### Step 3: Generate Contract ABIs

```bash
# Compile contracts
npx hardhat compile

# Generate ABIs (automatic with setup script)
npm run setup:local
```

This creates:
- `app/lib/abis/PredictionMarket.json`
- `app/lib/abis/USDC.json`

### Step 4: Create Required Images

Create these files in `/public`:

1. **icon.png** (512x512px) - App icon
2. **splash.png** (1200x630px) - Frame loading image  
3. **og-default.png** (1200x630px) - Social sharing image

Quick placeholders:
```bash
# Using ImageMagick (if installed)
convert -size 512x512 xc:#8b5cf6 public/icon.png
convert -size 1200x630 xc:#111827 public/splash.png
convert -size 1200x630 xc:#111827 public/og-default.png
```

### Step 5: Local Development

```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts and set up test data
npm run setup:local

# Terminal 2: Start frontend
npm run dev
```

### Step 6: Connect MetaMask

1. Open MetaMask
2. Add network: Localhost 8545
3. Import test account:
   - Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This is Hardhat's first test account with ETH

## ⚙️ Configuration

### Files You MUST Update

1. **`.env.local`** - All environment variables
   - Add your API keys
   - Update contract addresses after deployment
   - Set your private key for deployment

2. **`app/lib/constants.ts`** - If adding new chains or assets
   ```typescript
   // Add new assets here
   export const ASSETS = [
     { id: 'BTC', name: 'Bitcoin', icon: '₿' },
     { id: 'ETH', name: 'Ethereum', icon: 'Ξ' },
     // Add more...
   ];
   ```

3. **`hardhat.config.js`** - If deploying to different networks
   ```javascript
   // Add new networks here
   networks: {
     yourNetwork: {
       url: "https://...",
       accounts: [process.env.PRIVATE_KEY],
       chainId: 12345,
     }
   }
   ```

### Optional Configurations

- **Price Feeds**: Update in `USDCPredictionMarket.sol` constructor
- **Fee Percentage**: Change `FEE_PERCENTAGE` in contract (requires redeployment)
- **Min Bet**: Change `DEFAULT_MIN_BET` in contract
- **Market Logic**: Customize one-sided market behavior in `calculateWinnings()` function

## 💻 Development Workflow

### Making Contract Changes

1. Edit contracts in `/contracts`
2. Compile: `npx hardhat compile`
3. Test: `npx hardhat test`
4. Deploy: `npm run deploy:sepolia` (for testnet)
5. Regenerate ABIs: `npm run setup:local`
6. Update frontend hooks if needed

### Making Frontend Changes

1. Edit components in `/app`
2. Hot reload active with `npm run dev`
3. Test with local contracts

### Adding New Features

1. **New Asset Support**:
   - Add price feed address in contract
   - Update `ASSETS` in constants.ts
   - Add icon/styling

2. **New Market Types**:
   - Create new contract functions
   - Update frontend components
   - Add new hooks

## 🚢 Deployment

### Current Deployment Status

**Active Contract**: `0x93f0C0a18478Be1370224481155D21D974C95234` (Base Sepolia)

**Key Features**:
- ✅ **Deadline-based Resolution**: Markets resolve using Chainlink price at deadline (prevents manipulation)
- ✅ **5-Minute Tolerance**: Strict accuracy requirements for price data
- ✅ **Base Mainnet Price Feeds**: Real CBBTC/USD and ETH/USD prices (no mock data)
- ✅ **Fair One-Sided Logic**: Users get their stake back if no opposing bets
- ✅ **Fee Withdrawal**: Admin can withdraw accumulated fees
- ✅ **Forfeited Withdrawal**: Admin can withdraw forfeited amounts
- ✅ **Smart Notifications**: Improved toast system with deduplication
- ✅ **Smart USDC Approval**: Skips approval if user already has sufficient allowance
- ✅ **Production Ready**: All components updated and tested
- ✅ **Price Conversion Fixed**: Frontend correctly converts prices to/from 8 decimals for Chainlink compatibility

**Price Feeds**:
- **CBBTC/USD**: `0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D` (Base Mainnet)
- **ETH/USD**: `0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70` (Base Mainnet)

**Legacy Contract**: `0x33900910C893E5bc9eEab1B13e21fC45a9A377f7`
- Contains resolved markets from previous deployment
- No longer in use

### Deploy to Base Sepolia (Testnet)

1. **Get Test Funds**
   ```bash
   # Get Base Sepolia ETH
   https://www.alchemy.com/faucets/base-sepolia
   
   # Get test USDC from Circle
   https://faucet.circle.com/
   ```

2. **Deploy Contracts**
   ```bash
   npm run deploy:sepolia
   ```

3. **Update Frontend Config**
   - Copy deployed contract address to `.env.local`
   - Commit changes

4. **Deploy Frontend to Vercel**
   ```bash
   git push origin main
   # Connect repo to Vercel
   # Add environment variables in Vercel dashboard
   ```

### Production Checklist

- [ ] Audit smart contracts
- [ ] Update to Base mainnet in configs
- [ ] Use real USDC address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- [ ] Set up multisig for contract ownership
- [ ] Enable Farcaster app in production
- [ ] Add monitoring and analytics

## 🧪 Testing

### Contract Tests
```bash
# Run all tests
npm test

# With coverage
npm run test:coverage

# Specific test
npx hardhat test test/PredictionMarket.test.js
```

### Manual Testing Flow

1. **Create Market**
   - Connect wallet
   - Sign in with Farcaster
   - Create market with test parameters

2. **Place Bets**
   - Approve USDC (or skip if already approved)
   - Bet YES or NO
   - Check odds update

3. **Test One-Sided Markets**
   - Create market with only YES bets
   - Resolve to YES: Users get money back (no fee)
   - Resolve to NO: Users lose money

4. **Test Deadline Resolution**
   - Create market with 1-hour duration
   - Wait for deadline
   - Verify resolution uses price at deadline (not current price)

5. **Resolve Market**
   - Wait for deadline
   - Call resolve function
   - Claim winnings

6. **Admin Functions**
   - Test fee withdrawal
   - Test forfeited amount withdrawal

### Frame Testing

1. Share frame URL in Warpcast:
   ```
   https://your-app.vercel.app/api/frame?id=0
   ```

2. Test buttons work correctly

3. Verify transaction flow

## 📁 File Structure & Descriptions

### Smart Contracts (`/contracts`)

- **`core/USDCPredictionMarket.sol`**
  - Main prediction market logic
  - Handles market creation, betting, resolution
  - Integrates Base Mainnet Chainlink price feeds
  - Deadline-based resolution (prevents manipulation)
  - Fair one-sided market logic (no trapped funds)
  - Fee and forfeited amount withdrawal functions
  - 5-minute tolerance for price accuracy

- **`mocks/MockUSDC.sol`**
  - Test USDC token for local development
  - Mintable by anyone for testing

- **`mocks/MockAggregator.sol`**
  - Simulates Chainlink price feeds locally
  - Allows manual price updates for testing

### Frontend App (`/app`)

#### API Routes (`/app/api`)

- **`auth/session/route.ts`**
  - Manages Farcaster session with JWT
  - Stores user authentication state

- **`frame/route.tsx`**
  - Main frame endpoint
  - Returns frame metadata for Farcaster

- **`frame/image/route.tsx`**
  - Generates dynamic OG images
  - Shows market state visually

- **`frame/bet/route.ts`**
  - Handles betting from frames
  - Generates transaction data

- **`markets/[id]/route.ts`**
  - REST API for market data
  - Used by frontend components

#### Components (`/app/components`)

- **`auth/AuthButton.tsx`**
  - Smart auth button showing connection state
  - Handles both Farcaster and wallet

- **`auth/AuthGuard.tsx`**
  - Full-page auth flow
  - Step-by-step connection guide

- **`markets/CreateMarketWizard.tsx`**
  - 4-step market creation flow
  - Validates inputs at each step

- **`markets/MarketCard.tsx`**
  - Individual market display
  - Shows odds, prices, deadlines
  - Real-time price updates from Base Mainnet

- **`markets/BetModal.tsx`**
  - Betting interface
  - Smart USDC approval flow
  - Skips approval if already sufficient

- **`markets/ResolvedMarketCard.tsx`**
  - Displays resolved markets
  - Shows winnings and claim status
  - Handles "Already claimed" scenarios

#### Hooks (`/app/hooks`)

- **`useWeb3Auth.ts`**
  - Combined auth state management
  - Handles Farcaster + wallet + network

- **`useContracts.ts`**
  - All smart contract interactions
  - Read/write operations
  - Includes useWithdrawForfeited hook

- **`useUSDC.ts`**
  - USDC-specific operations
  - Balance, allowance, approval
  - Smart approval skipping

- **`usePlaceBet.ts`**
  - Bet placement logic
  - Transaction handling

- **`useChainlinkPrices.ts`**
  - Real-time price fetching from Base Mainnet
  - CBBTC/USD and ETH/USD feeds
  - 100% Alchemy RPC (no fallbacks)

- **`useWithdrawFees.ts`**
  - Admin fee withdrawal functionality

- **`useWithdrawForfeited.ts`**
  - Admin forfeited amount withdrawal functionality

#### Providers (`/app/providers`)

- **`Web3Provider.tsx`**
  - Wagmi + RainbowKit setup
  - Wallet connection management

- **`FarcasterProvider.tsx`**
  - Farcaster authentication
  - Session management

- **`ToastProvider.tsx`**
  - Smart notification system
  - Max 3 toasts, deduplication, dynamic durations

### Scripts (`/scripts`)

- **`deploy-base-sepolia.js`**
  - Production deployment script
  - Configures Base Mainnet price feeds
  - Saves deployment info

- **`setup-local.js`**
  - Complete local environment
  - Deploys contracts
  - Creates test markets
  - Generates ABIs

- **`interact.js`**
  - Contract interaction utilities
  - Test market creation

- **`verify.js`**
  - Basescan verification
  - Verifies implementation

- **`upgrade.js`**
  - Upgrade proxy to new implementation
  - Maintains state

- **`check-fees.js`**
  - Check fee status and market details

- **`check-actual-fees.js`**
  - Analyze forfeited amounts and market pools

- **`contract-status.js`**
  - Compare old vs new contract status

- **`update-price-feeds.js`**
  - Update price feed addresses on deployed contract

- **`test-new-contract.js`**
  - Test new contract functionality

- **`check-deployment-status.js`**
  - Verify contract deployment status

### Configuration Files (Root)

- **`hardhat.config.js`**
  - Network configurations
  - Compiler settings with viaIR for stack optimization
  - Plugin setup

- **`package.json`**
  - Dependencies
  - NPM scripts
  - Project metadata

- **`next.config.js`**
  - Next.js configuration
  - Webpack overrides

- **`tailwind.config.js`**
  - Styling configuration
  - Custom colors

- **`.env.example`**
  - Environment template
  - Shows required variables

## 🛠️ Troubleshooting

### Common Issues

**"Cannot find module '@/app/lib/abis/PredictionMarket.json'"**
- Run `npx hardhat compile` then `npm run setup:local`
- This generates the required ABI files

**"Insufficient funds"**
- For testnet: Get Base Sepolia ETH from faucet
- For local: Restart hardhat node

**"USDC transfer failed"**
- Check USDC balance
- Ensure approval is set (or check if smart approval is working)
- Verify contract addresses match
- Check if market is resolved and winnings are available

**"Already claimed" error**
- This is expected behavior - user has already claimed winnings
- Frontend should hide "Claim Winnings" button for claimed markets

**"Frame not rendering"**
- Check all images exist in `/public`
- Verify meta tags in frame response
- Test with Farcaster frame validator

**MetaMask shows wrong network**
- Switch to Base Sepolia (Chain ID: 84532)
- Or localhost:8545 for local dev

**"Stack too deep" compilation error**
- Contract uses viaIR optimization in hardhat.config.js
- This is normal for complex contracts

**Price feeds showing incorrect values**
- Frontend now uses Base Mainnet price feeds via Alchemy
- No more mock prices or fallback RPCs
- Check Alchemy API key is valid

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Make changes and test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing`
6. Open Pull Request

### Development Guidelines

- Always run tests before committing
- Update ABIs after contract changes
- Follow existing code style
- Add comments for complex logic
- Update README for new features
- Test one-sided market scenarios thoroughly
- Verify fee withdrawal functionality
- Test deadline-based resolution logic
- Ensure price feeds are working correctly

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Farcaster team for the auth kit and frames
- Chainlink for reliable price feeds on Base Mainnet
- Base team for the L2 infrastructure
- OpenZeppelin for secure contract patterns

---

Built with ❤️ for the Farcaster community# Updated contract address
# Trigger redeploy with fixed contract
# Force redeploy with latest contract
