const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require("@openzeppelin/test-helpers");

describe('Anoncats', function() {
  let anoncats;
  let signers;

  beforeEach(async () => {
    signers = await ethers.getSigners();

    const Anoncats = await ethers.getContractFactory('Anoncats');
    anoncats = await Anoncats.deploy(
      "Anoncats",
      "ANONCAT",
      signers[0].address
    );
    await anoncats.deployed();
  });

  it('It should display name and symbol correctly', async function() {
    // Sanity check to see if everything is working properly
    expect(await anoncats.name()).to.equal('Anoncats');
    expect(await anoncats.symbol()).to.equal('ANONCAT');
  });

  it('It should display the owner correctly', async function() {
    expect(await anoncats.owner()).to.equal(signers[0].address);
  })

  it("It should only allow all onlyOwner functions can only be executed by owner", async function() {
    await expect(anoncats.connect(signers[3]).pause()).to.be.reverted;
    await expect(anoncats.connect(signers[3]).unpause()).to.be.reverted;
    await expect(anoncats.connect(signers[3]).mint("testuri")).to.be.reverted;
    await anoncats.mint("testuri");
    await expect(anoncats.connect(signers[3]).setTokenURI('new')).to.be.reverted;
    await expect(anoncats.connect(signers[3]).transferOwnership(signers[3].address)).to.be.reverted;
    await expect(anoncats.connect(signers[3]).renounceOwnership(signers[3].address)).to.be.reverted;
 });

  it('It should only allow the creator to set URI when in possession of NFT', async function() {
    await anoncats.mint('testuri');
    expect(await anoncats.totalSupply()).to.equal(1);
    expect(await anoncats.ownerOf(1)).to.equal(signers[0].address);
    expect(await anoncats.tokenURI(1)).to.equal('testuri');

    await anoncats.setTokenURI(1, 'testuri2');
    expect(await anoncats.tokenURI(1)).to.equal('testuri2');

    await expect(anoncats.connect(signers[3]).setTokenURI(1, 'testuri3')).to.be.reverted;

    await anoncats.transferFrom(signers[0].address, signers[1].address, 1);
    expect(await anoncats.totalSupply()).to.equal(1);
    expect(await anoncats.ownerOf(1)).to.equal(signers[1].address);
    await expect(anoncats.setTokenURI(1, 'testuri4')).to.be.reverted;
    await expect(anoncats.transferFrom(signers[0].address, signers[1].address, 1)).to.be.reverted;

    await anoncats.connect(signers[1]).transferFrom(signers[1].address, signers[0].address, 1);
    expect(await anoncats.totalSupply()).to.equal(1);
    expect(await anoncats.ownerOf(1)).to.equal(signers[0].address);
    await anoncats.setTokenURI(1, 'testuri4');
    expect(await anoncats.tokenURI(1)).to.equal('testuri4');
  });

  it('It should only allow for a supply of 100 Anoncats', async function () {
    for (let i = 1; i <= 100; i++) {
      await anoncats.mint('testuri');
      expect(await anoncats.totalSupply()).to.equal(i);
      expect(await anoncats.balanceOf(signers[0].address)).to.equal(i);
      expect(await anoncats.ownerOf(i)).to.equal(signers[0].address);
      expect(await anoncats.tokenOfOwnerByIndex(signers[0].address, i - 1)).to.equal(i);
      expect(await anoncats.tokenByIndex(i - 1)).to.equal(i);
    }
    await expect(anoncats.mint('testuri')).to.be.reverted;
  });

  it('It should not allow double voting', async function () {
    await anoncats.mint('testuri');
    let currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    let blockNumber = await ethers.provider.getBlockNumber();
    let priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("0");
    expect(priorVotes.toString()).to.equal("0");

    await anoncats.delegate(signers[0].address);
    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("1");
    expect(priorVotes.toString()).to.equal("0");

    await anoncats.delegate(signers[0].address);
    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("1");
    expect(priorVotes.toString()).to.equal("1");

    await anoncats.transferFrom(signers[0].address, signers[1].address, 1);
    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("0");
    expect(priorVotes.toString()).to.equal("1");
    currentVotes = await anoncats.getCurrentVotes(signers[1].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[1].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("0");
    expect(priorVotes.toString()).to.equal("0");

    await anoncats.connect(signers[1]).delegate(signers[1].address);
    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("0");
    expect(priorVotes.toString()).to.equal("0");
    currentVotes = await anoncats.getCurrentVotes(signers[1].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[1].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("1");
    expect(priorVotes.toString()).to.equal("0");

    await anoncats.connect(signers[1]).delegate(signers[1].address);
    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("0");
    expect(priorVotes.toString()).to.equal("0");
    currentVotes = await anoncats.getCurrentVotes(signers[1].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[1].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("1");
    expect(priorVotes.toString()).to.equal("1");
  });

  it('It should show the right number of delegated votes', async function () {
    await anoncats.mint('testuri');
    let currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    let blockNumber = await ethers.provider.getBlockNumber();
    let priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("0");
    expect(priorVotes.toString()).to.equal("0");

    await anoncats.delegate(signers[0].address);

    await anoncats.mint('testuri');
    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("2");
    expect(priorVotes.toString()).to.equal("1");

    await anoncats.mint('testuri');
    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("3");
    expect(priorVotes.toString()).to.equal("2");

    await anoncats.mint('testuri');
    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("4");
    expect(priorVotes.toString()).to.equal("3");

    await anoncats.transferFrom(signers[0].address, signers[1].address, 1);
    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("3");
    expect(priorVotes.toString()).to.equal("4");
    currentVotes = await anoncats.getCurrentVotes(signers[1].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[1].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("0");
    expect(priorVotes.toString()).to.equal("0");
    await anoncats.connect(signers[1]).delegate(signers[1].address);
    currentVotes = await anoncats.getCurrentVotes(signers[1].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[1].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("1");
    expect(priorVotes.toString()).to.equal("0");

    await anoncats.transferFrom(signers[0].address, signers[1].address, 2);
    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("2");
    expect(priorVotes.toString()).to.equal("3");
    currentVotes = await anoncats.getCurrentVotes(signers[1].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[1].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("2");
    expect(priorVotes.toString()).to.equal("1");

    await anoncats.transferFrom(signers[0].address, signers[1].address, 3);
    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("1");
    expect(priorVotes.toString()).to.equal("2");
    currentVotes = await anoncats.getCurrentVotes(signers[1].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[1].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("3");
    expect(priorVotes.toString()).to.equal("2");

    await anoncats.transferFrom(signers[0].address, signers[1].address, 4);
    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("0");
    expect(priorVotes.toString()).to.equal("1");
    currentVotes = await anoncats.getCurrentVotes(signers[1].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[1].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("4");
    expect(priorVotes.toString()).to.equal("3");
  });

  it('It should only allow the creator to set URI when in possession of NFT', async function() {
    await anoncats.mint('testuri');
    let currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    let blockNumber = await ethers.provider.getBlockNumber();
    let priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("0");
    expect(priorVotes.toString()).to.equal("0");

    let domain = {
      name: "Anoncats",
      chainId: 31337,  // for testing on hardhat
      verifyingContract: anoncats.address,
    }

    let types = {
      Delegation: [
        {name: 'delegatee', type: 'address'},
        {name: 'nonce', type: 'uint256'},
        {name: 'expiry', type: 'uint256'},
      ]
    }

    let timeNow = await time.latest();
    expiry = ethers.BigNumber.from(timeNow.toString()).add(10);

    let values = {
      delegatee: signers[0].address,
      nonce: 0,
      expiry: expiry
    }

    let signature = await signers[0]._signTypedData(domain, types, values);
    signature = signature.substring(2);
    let r = '0x' + signature.substring(0,64);
    let s = '0x' + signature.substring(64,128);
    let v = parseInt(signature.substring(128,130), 16);

    await anoncats.delegateBySig(
      signers[0].address,
      0,
      expiry,
      v, r, s);

    currentVotes = await anoncats.getCurrentVotes(signers[0].address);
    blockNumber = await ethers.provider.getBlockNumber();
    priorVotes = await anoncats.getPriorVotes(signers[0].address, blockNumber - 1);
    expect(currentVotes.toString()).to.equal("1");
    expect(priorVotes.toString()).to.equal("0");
  });
});