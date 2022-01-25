const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account: ", deployer.address
  );

  console.log("Account balance: ", (await deployer.getBalance()).toString());

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy();
  console.log("Vault address: ", await vault.address);
  console.log("Account balance after Vault deploy: ", (await deployer.getBalance()).toString());

  const VaultAttack = await ethers.getContractFactory("VaultAttack");
  const vaultAttack = await VaultAttack.deploy();
  console.log("VaultAttack address: ", await vaultAttack.address);
  console.log("Account balance after VaultAttack deploy: ", (await deployer.getBalance()).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
