// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract USDCPredictionMarket is 
    Ownable, 
    ReentrancyGuard
{
    struct Market {
        string question;
        string asset;
        uint256 targetPrice;
        uint256 deadline;
        uint256 deadlineRoundId; // Store the round ID that should correspond to deadline
        uint256 yesPool;
        uint256 noPool;
        bool resolved;
        bool outcome;
        address creator;
        uint256 minBet;
        uint256 totalFees;
        bool isAbove; // true for "above", false for "below"
        mapping(address => Position) positions;
    }

    struct Position {
        uint256 yesAmount;
        uint256 noAmount;
        bool claimed;
    }

    IERC20 public usdc;
    uint256 public marketIdCounter;
    uint256 public constant FEE_PERCENTAGE = 1; // 1% fee on winnings
    uint256 public constant DEFAULT_MIN_BET = 1e6; // 1 USDC (6 decimals)
    
    mapping(uint256 => Market) public markets;
    mapping(string => address) public priceFeeds;
    
    event MarketCreated(
        uint256 indexed marketId, 
        string asset, 
        uint256 targetPrice, 
        uint256 deadline,
        address indexed creator
    );
    event BetPlaced(
        uint256 indexed marketId, 
        address indexed user, 
        bool isYes, 
        uint256 amount
    );
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    event FeesWithdrawn(uint256 amount);
    event ForfeitedWithdrawn(uint256 amount);

    constructor(address _usdcAddress) Ownable(msg.sender) {
        usdc = IERC20(_usdcAddress);
        
        // Initialize price feeds for Base Mainnet
        priceFeeds["BTC"] = 0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D; // CBBTC/USD
        priceFeeds["ETH"] = 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70; // ETH/USD
    }

    function addPriceFeed(string memory asset, address feed) external onlyOwner {
        require(feed != address(0), "Invalid feed address");
        priceFeeds[asset] = feed;
    }

    function createMarket(
        string memory _asset,
        uint256 _targetPrice,
        uint256 _duration,
        uint256 _minBet,
        bool _isAbove
    ) external returns (uint256) {
        require(priceFeeds[_asset] != address(0), "Asset not supported");
        require(_duration >= 1 hours && _duration <= 90 days, "Invalid duration");
        require(_minBet >= DEFAULT_MIN_BET, "Min bet too low");
        
        uint256 marketId = marketIdCounter++;
        Market storage newMarket = markets[marketId];
        
        string memory condition = _isAbove ? "above" : "below";
        newMarket.question = string(abi.encodePacked(
            "Will ", _asset, " be ", condition, " $", toString(_targetPrice / 1e8), "?"
        ));
        newMarket.asset = _asset;
        newMarket.targetPrice = _targetPrice * 1e8; // Convert to 8 decimals for Chainlink
        newMarket.deadline = block.timestamp + _duration;
        
        // Store the current round ID and estimate the round ID at deadline
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeeds[_asset]);
        
        // Try to get current round ID, but don't fail if price feed is not available
        uint80 currentRoundId = 0;
        try priceFeed.latestRoundData() returns (uint80 roundIdResult, int256, uint256, uint256, uint80) {
            currentRoundId = roundIdResult;
        } catch {
            // If price feed fails, use a default round ID
            currentRoundId = 1;
        }
        
        // Estimate round ID at deadline (assuming ~1 round per 15 seconds)
        uint256 timeToDeadline = _duration;
        uint256 estimatedRounds = timeToDeadline / 15; // Rough estimate
        newMarket.deadlineRoundId = currentRoundId + uint80(estimatedRounds);
        
        newMarket.creator = msg.sender;
        newMarket.minBet = _minBet;
        newMarket.isAbove = _isAbove;
        
        emit MarketCreated(marketId, _asset, _targetPrice, newMarket.deadline, msg.sender);
        return marketId;
    }

    function placeBet(uint256 _marketId, bool _isYes, uint256 _amount) external nonReentrant {
        Market storage market = markets[_marketId];
        require(block.timestamp < market.deadline, "Market expired");
        require(!market.resolved, "Market already resolved");
        require(_amount >= market.minBet, "Bet too small");
        
        // Transfer USDC from user (no fee on placing bet)
        require(usdc.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");
        
        if (_isYes) {
            market.yesPool += _amount;
            market.positions[msg.sender].yesAmount += _amount;
        } else {
            market.noPool += _amount;
            market.positions[msg.sender].noAmount += _amount;
        }
        
        emit BetPlaced(_marketId, msg.sender, _isYes, _amount);
    }

    function resolveMarket(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(block.timestamp >= market.deadline, "Market not expired");
        require(!market.resolved, "Already resolved");
        
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeeds[market.asset]);
        
        // Try to get the price at the deadline using the stored round ID
        (uint80 roundId, int256 price, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) = 
            priceFeed.getRoundData(uint80(market.deadlineRoundId));
        
        // If the round doesn't exist or is too far from deadline, find the closest round
        if (updatedAt == 0 || abs(int256(updatedAt) - int256(market.deadline)) > 300) {
            (roundId, price, startedAt, updatedAt, answeredInRound) = findClosestRound(priceFeed, market.deadline);
        }
        
        require(updatedAt > 0, "Invalid price data");
        require(price > 0, "Invalid price");
        require(abs(int256(updatedAt) - int256(market.deadline)) <= 300, "Price too far from deadline");
        
        // For "above" markets: YES wins if price > target, NO wins if price <= target
        // For "below" markets: YES wins if price < target, NO wins if price >= target
        if (market.isAbove) {
            market.outcome = uint256(price) > market.targetPrice;
        } else {
            market.outcome = uint256(price) < market.targetPrice;
        }
        
        market.resolved = true;
        
        emit MarketResolved(_marketId, market.outcome);
    }
    
    function findClosestRound(AggregatorV3Interface priceFeed, uint256 deadline) internal view returns (
        uint80 roundId, int256 price, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound
    ) {
        uint80 currentRoundId = 1;
        try priceFeed.latestRoundData() returns (uint80 roundIdResult, int256, uint256, uint256, uint80) {
            currentRoundId = roundIdResult;
        } catch {
            // If price feed fails, use a default round ID
            currentRoundId = 1;
        }
        
        uint256 bestRoundId = currentRoundId;
        uint256 bestTimeDiff = type(uint256).max;
        
        for (uint80 i = currentRoundId; i > 0 && i > currentRoundId - 1000; i--) {
            try priceFeed.getRoundData(i) returns (uint80, int256, uint256, uint256, uint80) {
                (,,,uint256 roundUpdatedAt,) = priceFeed.getRoundData(i);
                if (roundUpdatedAt > 0) {
                    uint256 timeDiff = abs(int256(roundUpdatedAt) - int256(deadline));
                    if (timeDiff < bestTimeDiff) {
                        bestTimeDiff = timeDiff;
                        bestRoundId = i;
                    }
                    if (timeDiff <= 300) break; // Found a round within 5 minutes
                }
            } catch {
                continue;
            }
        }
        
        return priceFeed.getRoundData(uint80(bestRoundId));
    }
    
    function abs(int256 x) internal pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }

    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved");
        
        Position storage position = market.positions[msg.sender];
        require(!position.claimed, "Already claimed");
        
        uint256 grossWinnings = calculateWinnings(_marketId, msg.sender);
        require(grossWinnings > 0, "No winnings");
        
        uint256 userStake = market.outcome ? position.yesAmount : position.noAmount;
        uint256 losingPool = market.outcome ? market.noPool : market.yesPool;
        
        uint256 netWinnings;
        uint256 fee = 0;
        
        // If user bet on winning side but there's no opposing pool, return stake without fee
        if (userStake > 0 && losingPool == 0) {
            netWinnings = userStake;
        } else {
            // Calculate 1% fee on winnings (not on original stake)
            uint256 profit = grossWinnings > userStake ? grossWinnings - userStake : 0;
            fee = (profit * FEE_PERCENTAGE) / 100;
            netWinnings = grossWinnings - fee;
        }
        
        market.totalFees += fee;
        position.claimed = true;
        
        // Transfer USDC winnings to user
        require(usdc.transfer(msg.sender, netWinnings), "USDC transfer failed");
        
        emit WinningsClaimed(_marketId, msg.sender, netWinnings);
    }

    function calculateWinnings(uint256 _marketId, address _user) public view returns (uint256) {
        Market storage market = markets[_marketId];
        Position storage position = market.positions[_user];
        
        if (!market.resolved || position.claimed) return 0;
        
        uint256 winningPool = market.outcome ? market.yesPool : market.noPool;
        uint256 losingPool = market.outcome ? market.noPool : market.yesPool;
        uint256 userStake = market.outcome ? position.yesAmount : position.noAmount;
        
        if (userStake == 0) return 0;
        
        // If user bet on winning side but there's no opposing pool, return their stake
        if (userStake > 0 && losingPool == 0) {
            return userStake;
        }
        
        // If there's no winning pool, user loses their stake
        if (winningPool == 0) return 0;
        
        // Normal case: User gets their stake back plus proportional share of losing pool
        return userStake + (userStake * losingPool) / winningPool;
    }

    function getOdds(uint256 _marketId) external view returns (uint256 yesOdds, uint256 noOdds) {
        Market storage market = markets[_marketId];
        uint256 total = market.yesPool + market.noPool;
        
        if (total == 0) return (50, 50);
        
        yesOdds = (market.noPool * 100) / total;
        noOdds = (market.yesPool * 100) / total;
    }

    function getMarketInfo(uint256 _marketId) external view returns (
        string memory question,
        string memory asset,
        uint256 targetPrice,
        uint256 deadline,
        uint256 yesPool,
        uint256 noPool,
        bool resolved,
        bool outcome,
        address creator,
        bool isAbove
    ) {
        Market storage market = markets[_marketId];
        return (
            market.question,
            market.asset,
            market.targetPrice / 1e8, // Convert back from Chainlink format
            market.deadline,
            market.yesPool,
            market.noPool,
            market.resolved,
            market.outcome,
            market.creator,
            market.isAbove
        );
    }

    function getUserPosition(uint256 _marketId, address _user) external view returns (
        uint256 yesAmount,
        uint256 noAmount,
        bool claimed,
        uint256 potentialWinnings
    ) {
        Position storage position = markets[_marketId].positions[_user];
        return (
            position.yesAmount,
            position.noAmount,
            position.claimed,
            calculateWinnings(_marketId, _user)
        );
    }

    function withdrawFees() external onlyOwner {
        uint256 totalFees = 0;
        // Sum up all market fees
        for (uint i = 0; i < marketIdCounter; i++) {
            totalFees += markets[i].totalFees;
            markets[i].totalFees = 0;
        }
        
        require(totalFees > 0, "No fees to withdraw");
        require(usdc.transfer(owner(), totalFees), "Fee withdrawal failed");
        
        emit FeesWithdrawn(totalFees);
    }

    function withdrawForfeited() external onlyOwner {
        uint256 totalForfeited = 0;
        
        // Sum up all forfeited amounts from resolved markets
        // Note: With new logic, forfeited amounts only occur when there are bets on both sides
        // but no one bet on the winning side
        for (uint i = 0; i < marketIdCounter; i++) {
            Market storage market = markets[i];
            if (market.resolved) {
                uint256 winningPool = market.outcome ? market.yesPool : market.noPool;
                uint256 losingPool = market.outcome ? market.noPool : market.yesPool;
                
                // If there's a losing pool but no winning pool, it's forfeited
                // This only happens when there are bets on both sides but no one bet on the winning side
                if (losingPool > 0 && winningPool == 0) {
                    totalForfeited += losingPool;
                    // Clear the losing pool after withdrawing
                    if (market.outcome) {
                        market.noPool = 0;
                    } else {
                        market.yesPool = 0;
                    }
                }
            }
        }
        
        require(totalForfeited > 0, "No forfeited amounts to withdraw");
        require(usdc.transfer(owner(), totalForfeited), "Forfeited withdrawal failed");
        
        emit ForfeitedWithdrawn(totalForfeited);
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
}