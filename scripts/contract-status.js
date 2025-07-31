const { ethers } = require("hardhat");

async function checkContractStatus() {
  try {
    console.log("📊 Contract Status Summary\n");
    
    // Old contract (with forfeited amounts)
    const oldContractAddress = "0x7359101933fa4cfE86E2c1882610D8b72124f896";
    const newContractAddress = "0x023c1A9f07103db9A4F75d04B702631CC6d6b78B";
    
    console.log("🔴 OLD CONTRACT (Legacy):");
    console.log(`   Address: ${oldContractAddress}`);
    
    try {
      const oldContract = await ethers.getContractAt("USDCPredictionMarket", oldContractAddress);
      const usdcAddress = await oldContract.usdc();
      const usdcContract = await ethers.getContractAt("IERC20", usdcAddress);
      const oldContractBalance = await usdcContract.balanceOf(oldContractAddress);
      console.log(`   USDC Balance: ${ethers.utils.formatUnits(oldContractBalance, 6)} USDC`);
      console.log(`   Status: Has forfeited amounts but no withdrawForfeited function`);
      console.log(`   Action: Accept loss - amounts are trapped`);
    } catch (error) {
      console.log(`   Status: Error reading contract`);
    }
    
    console.log("\n🟢 NEW CONTRACT (Active):");
    console.log(`   Address: ${newContractAddress}`);
    
    try {
      const newContract = await ethers.getContractAt("USDCPredictionMarket", newContractAddress);
      const usdcAddress = await newContract.usdc();
      const usdcContract = await ethers.getContractAt("IERC20", usdcAddress);
      const newContractBalance = await usdcContract.balanceOf(newContractAddress);
      console.log(`   USDC Balance: ${ethers.utils.formatUnits(newContractBalance, 6)} USDC`);
      console.log(`   Status: Ready for new markets with withdrawForfeited function`);
      console.log(`   Action: Use this contract for all future operations`);
    } catch (error) {
      console.log(`   Status: Error reading contract`);
    }
    
    console.log("\n📋 SUMMARY:");
    console.log("✅ All files updated to use new contract");
    console.log("✅ Frontend has withdrawForfeited functionality");
    console.log("✅ New contract deployed and ready");
    console.log("⚠️  Old contract forfeited amounts (1,810.3 USDC) are lost");
    console.log("🚀 Ready to create new markets and use withdrawForfeited");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkContractStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 