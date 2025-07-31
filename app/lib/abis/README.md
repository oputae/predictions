# Contract ABIs

This directory contains the Application Binary Interface (ABI) files needed for the frontend to interact with smart contracts.

## Required ABI Files

1. **PredictionMarket.json** - ABI for the main prediction market contract
2. **USDC.json** - ABI for the USDC token contract

## How to Generate ABIs

### Step 1: Compile Contracts
```bash
npx hardhat compile
```

This creates artifacts in the `/artifacts` directory.

### Step 2: Extract ABIs

After compilation, the ABIs are located in:
- `/artifacts/contracts/core/USDCPredictionMarket.sol/USDCPredictionMarket.json`
- `/artifacts/contracts/mocks/MockUSDC.sol/MockUSDC.json`

### Step 3: Copy ABIs to This Directory

#### Option A: Manual Copy
1. Open the artifact JSON files
2. Copy only the `"abi"` array
3. Create new files here with just the ABI

#### Option B: Use the Setup Script
Run the local setup script which automatically copies ABIs:
```bash
npm run setup:local
```

#### Option C: Manual Extraction Commands
```bash
# Extract PredictionMarket ABI
node -e "console.log(JSON.stringify(require('./artifacts/contracts/core/USDCPredictionMarket.sol/USDCPredictionMarket.json').abi, null, 2))" > app/lib/abis/PredictionMarket.json

# Extract USDC ABI  
node -e "console.log(JSON.stringify(require('./artifacts/contracts/mocks/MockUSDC.sol/MockUSDC.json').abi, null, 2))" > app/lib/abis/USDC.json
```

## For Production (Base Sepolia)

When using the real USDC contract on Base Sepolia, you can use the standard ERC20 ABI:

```json
[
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol", 
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_from", "type": "address"},
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
]
```

## Note

The ABI files are NOT included in version control because they're generated from the contracts. Always regenerate them after contract changes.