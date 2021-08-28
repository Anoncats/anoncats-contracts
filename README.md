# Anoncats
Anoncats is a collection of cat blobs and an experiment on NFTs based governance.
The repo is unaudited so use it at your own risk.

The Anoncats smart contracts are a fork of Compound's governance contract.
The governance contracts can be located in `contracts/governance`.
The key difference is that instead of a ERC20, ERC721 are used.
For simplicity, each ERC721 are given equal vote weights.

Open zeppelin contracts are used in interfaces and utils folder.

# Deployment Addresses
**Addresses are same on both Rinkeby and Mainnet**
```
Anoncats deployed to: 0xe7141C205a7a74241551dAF007537A041867e0B0
Timelock deployed to: 0xfF662FEbc210F4ddF03846bA093807CCb8EE034b
Delegate deployed to: 0x8455e7bDA4E629903165aB029eab18a2360DbA3e
Delegator deployed to: 0xCCAF310D9506d09806e78EcC52a09029d36Cea57
```

# Hardhat Readme
## Advanced Sample Hardhat Project

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.js
node scripts/deploy.js
npx eslint '**/*.js'
npx eslint '**/*.js' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

## Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.template file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.js
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```
