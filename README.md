# Vault Attack

Smart Contract Security Practice | Lv8 Vault Attack

```
!!! DON'T TRY ON MAINNET !!!
```

## Summary
The goal of this level is to unlock the contract protected by `password` private variable.

### Things might help:
- `private` data on `public` blockchain!?

### What you will learn:
- `visibility` modifier in smart contract
- storage layout

## Smart Contract Code
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Vault {
  bool public locked;
  bytes32 private password;

  constructor(bytes32 _password) public {
    locked = true;
    password = _password;
  }

  function unlock(bytes32 _password) public {
    if (password == _password) {
      locked = false;
    }
  }
}
```

## Solidity Concepts
### Visibility Modifier
Visibility modifiers define the visibility of state variables or functions.

#### external
Only functions can be marked `external`. External functions are part of the contract interface and can be called from other contracts and transactions. They can't be called internally. This leads to external functions being cheaper to execute.
Arguments of external functions can be directly read from calldata. They don't need to be copied over to memory like for public functions. The reason is that internal calls are executed through jumps in the code (under the hood). Array arguments are internally passed as memory pointers. Because of this, internal calls always need all variables in memory.

> **Best practice** Always use external when you don't want to call the function from within the same contract. This saves gas.

#### public
Both state variables (the properties of your contract) and functions can be marked as public.
Public state variables and functions can both be accessed from the outside and the inside. The Solidity compiler automatically creates a getter function fro them.
For a public state variable `myVar`, the compiler generates an automatic getter function `myVar()` that returns the value of `myVar`. When `myVar()` is called from within the same contract, `myVar` is actually accessed. If accessed externally, the function is evaluated.

> **Best practice** Use public for publicly accessible state variables and when you want functions accessible from the outside and inside.

#### internal
Internal is the default visibility for state variables.
Internal functions and state variables can both be accessed from within the same contract and in deriving contracts. They aren't accessible from the outside.
> **Best practice** Use internal whenever you think state variables and functions should also be accessible in deriving contracts.

#### private
Private is the most restrictive visibility.
State variables and functions marked as private are only visible and accessible in the same contract.

**Important**: Private is only a code-level visibility modifier. Your contract state marked as private is still visible to observers of the blockchain. It is just not accessible for other contracts.

**Best practice**: Use private when you really want to protect your state variables and functions because you hide them behind logic executed through internal or public functions.

### Storage Layout
Data stored in storage is laid out in 32 bytes slots which start at index 0. Variables are indexed in the order they're defined in contract.

```solidity
contract Sample {
    uint256 a; // slot 0
    uint128 b; // slot 1
    bytes16 c; // slot 1
}
```

- Bytes are being used starting from the right of the slot.
- If a variable takes under 256 bits to represent, leftover space will be shared with following variables if they fit in this same slot.
- If a variable does not fit the remaining part of a storage slot, it's moved to the next storage slot.
- Structs and arrays (non elementary types) always start a new slot and occupy whole slots (but items inside a struct or array are packed tightly according the rules).
- Constants don't use this type of storage. (They don't occupy storage slots)

![68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f6d61782f323030302f312a77593853692d6d745f515a577167306a6e45447738412e6a706567](https://user-images.githubusercontent.com/45418310/151079805-287445e0-f644-44f8-bf2c-7739122552f3.jpg)

Knowing the contract's address and the storage slot of the variable, we can read its value by using `getStorageAt` function of `web3` or `ethers`.

## Security Consideration
### Security risk in the contract
Some people might think password is secure as it's `private` variable that can't be read outside the contract.
But we know the contract address and the storage slot of the variable is 1(`bool locked` occupies slot 0 and `bytes32 password` goes into the slot 1).
So by using `ethers.getStorageAt(vault.address, 1)` anyone can get the password and you can it to unlock the contract.

### How we can improve the contract
We can store the hash vaule of the `password` instead of plain data and check hash in `unlock` function as well. Like this...

```solidity
    ...
    bytes32 private password;                                    // wrong
    bytes32 private passwordHash;                                // correct
    ...
    password = _password;                                        // wrong
    passwordHash = keccak256(abi.encodePacked(_password));       // correct
    ...
    if (password == _password) {                                 // wrong
    if (passwordHash = keccak256(abi.encodePacked(_password))) { // correct
    ...
```

### What we can say
- [Private Information and Randomness](https://docs.soliditylang.org/en/v0.6.2/security-considerations.html#private-information-and-randomness): addresses, timestamps, state changes and storage are publicly visible.
- Even if state variable is defined as private, it's visible outside the blockchain by using `getStorageAt`.
- When you need to store sensitive value onchain, store its hash.
 
## Deploy & Test
### Installation
```console
npm install
npx hardhat node
```

### Deployment
```console
npx hardhat run --network [NETWORK-NAME] scripts/deploy.js
```

### Test
You should see the contract is unlocked.
```console
dev@ubuntu:~/Documents/practice/vault-attack$ npx hardhat test


  Vault
    deployment
      ✓ should set locked
    #unlock
      ✓ should not unlock if user tries with invalid password
      ✓ should unlock if user tries with valid password

  VaultAttack
    deployment
      ✓ should set the attacker
    #attack
      ✓ should be reverted if non-attacker tries
      ✓ should unlock Vault contract if valid password given (40ms)
    Vault#password
      ✓ should get the password by using getStorageAt


  7 passing (1s)
```

If you're familiar with hardhat console, you can test the `Vault` on your local node by using `npx hardhat node` and `npx hardhat console`.
