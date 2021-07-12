
async function impersonateForToken(tokenInfo, receiver, amount) {
    console.log("Impersonating for " + tokenInfo.symbol);
  
    const token = await ethers.getContractAt("IERC20", tokenInfo.address);
    await receiver.sendTransaction({
      to: tokenInfo.holder,
      value: ethers.utils.parseEther("1.0")
    });
  
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [tokenInfo.holder]}
    )
  
    const signedHolder = await ethers.provider.getSigner(tokenInfo.holder);
    await token.connect(signedHolder).transfer(receiver.address, ethers.utils.parseUnits(amount, tokenInfo.decimals));
  
    await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [tokenInfo.holder]}
    )
  }
  
  
async function setNextBlockTimestamp(timestamp) {
    await hre.network.provider.request({
        method: "evm_setNextBlockTimestamp",
        params: [timestamp]}
    );
  }
  
  
async function approve(tokenInfo, owner, spender) {
    const token = await ethers.getContractAt("IERC20", tokenInfo.address);
    await token.connect(owner).approve(spender, ethers.constants.MaxUint256);
  }

module.exports = {
    approve,
    impersonateForToken,
    setNextBlockTimestamp
}
  