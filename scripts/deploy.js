// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const maintainer = "0x1ce139b73DBC1d855e4B360856aC3885558Fc5F8";
  const [owner] = await hre.ethers.getSigners();

  const Anoncats = await hre.ethers.getContractFactory("Anoncats");
  anoncats = await Anoncats.deploy(
    "Anoncats",
    "ANONCAT",
    "ar://",
    maintainer
  );
  await anoncats.deployed();
  console.log("Anoncats deployed to:", anoncats.address);

  // Predetermine GovernorBravoDelegator address
  // let nonce = await hre.ethers.provider.getTransactionCount(owner);
  let nonce = await owner.getTransactionCount();
  let adminAddress = hre.ethers.utils.getContractAddress({
    from: owner.address,
    nonce: nonce + 2
  })
  console.log("Delegator Address: ", adminAddress);

  const Timelock = await hre.ethers.getContractFactory("Timelock");
  timelock = await Timelock.deploy(
    adminAddress,
    172800 // 2 days
  );
  await timelock.deployed();
  console.log("Timelock deployed to:", timelock.address);

  const Delegate = await hre.ethers.getContractFactory("GovernorBravoDelegate");
  delegate = await Delegate.deploy();
  await delegate.deployed();
  console.log("Delegate deployed to:", delegate.address);

  const Delegator = await hre.ethers.getContractFactory("GovernorBravoDelegator");
  delegator = await Delegator.deploy(
    timelock.address,
    anoncats.address,
    maintainer,
    delegate.address,
    5760, // min voting period, in terms of number of blocks, this is around 22-24 hours
    1,  // min voting delay, in terms of number of blocks, this is around 14 seconds
    1,  // one anoncat proposal threshold
  );
  await delegator.deployed();  
  console.log("Delegator deployed to:", delegator.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
