const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vault", function () {
  let Vault, vault;
  let alice, bob, carol, signers;
  let pwdBytes;
  const pwdStr = "vault is locked with password";

  beforeEach(async function() {
    [alice, bob, carol, signers] = await ethers.getSigners();
    pwdBytes = stringToBytes32(pwdStr);
    Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy(pwdBytes);
  });

  describe("deployment", function() {
    it("should set locked", async function() {
      expect(await vault.locked()).to.equal(true);
    });
  });

  describe("#unlock", function() {
    it("should not unlock if user tries with invalid password", async function() {
      await vault.unlock(stringToBytes32("wrong password"));
      expect(await vault.locked()).to.equal(true);
    });

    it("should unlock if user tries with valid password", async function() {
      await vault.unlock(pwdBytes);
      expect(await vault.locked()).to.equal(false);
    });
  });

  var Zeros = "0x0000000000000000000000000000000000000000000000000000000000000000";
  function stringToBytes32(str) {
    let bytes = ethers.utils.toUtf8Bytes(str);
    if (bytes.length > 31) { throw new Error('too long'); }
    return ethers.utils.concat([bytes, Zeros]).slice(0, 32);
  }
});
