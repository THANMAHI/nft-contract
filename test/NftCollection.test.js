const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NftCollection", function () {
  let Nft, nft, owner, alice, bob, operator;
  const NAME = "MyNFT";
  const SYMBOL = "MNFT";
  const BASE = "https://metadata.example/token/";
  const MAX = 3;

  beforeEach(async () => {
    [owner, alice, bob, operator] = await ethers.getSigners();
    Nft = await ethers.getContractFactory("NftCollection");
    nft = await Nft.deploy(NAME, SYMBOL, BASE, MAX);
    // no nft.deployed() needed in ethers v6
  });

  it("initial state", async () => {
    expect(await nft.name()).to.equal(NAME);
    expect(await nft.symbol()).to.equal(SYMBOL);
    expect(await nft.maxSupply()).to.equal(MAX);
    expect(await nft.totalSupply()).to.equal(0);
  });

  it("owner can mint and totalSupply/balance update", async () => {
    await expect(nft.safeMint(alice.address))
      .to.emit(nft, "Transfer")
      .withArgs(ethers.ZeroAddress, alice.address, 1);

    expect(await nft.totalSupply()).to.equal(1);
    expect(await nft.balanceOf(alice.address)).to.equal(1);
    expect(await nft.ownerOf(1)).to.equal(alice.address);
  });

  it("cannot mint to zero address", async () => {
    await expect(nft.safeMint(ethers.ZeroAddress)).to.be.reverted;
  });

  it("non-owner cannot mint", async () => {
    await expect(nft.connect(alice).safeMint(alice.address)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("cannot mint beyond maxSupply", async () => {
    await nft.safeMint(alice.address); // id 1
    await nft.safeMint(alice.address); // id 2
    await nft.safeMint(bob.address);   // id 3

    // FIX: expect a custom error (contract uses `error MaxSupplyReached();`)
    await expect(nft.safeMint(owner.address)).to.be.revertedWithCustomError(nft, "MaxSupplyReached");
  });

  it("transfers by owner and approved operator work", async () => {
    await nft.safeMint(alice.address); // id 1
    await expect(nft.connect(alice).approve(bob.address, 1))
      .to.emit(nft, "Approval")
      .withArgs(alice.address, bob.address, 1);

    await expect(nft.connect(bob).transferFrom(alice.address, bob.address, 1))
      .to.emit(nft, "Transfer")
      .withArgs(alice.address, bob.address, 1);

    expect(await nft.ownerOf(1)).to.equal(bob.address);
    expect(await nft.balanceOf(alice.address)).to.equal(0);
    expect(await nft.balanceOf(bob.address)).to.equal(1);
  });

  it("setApprovalForAll and operator transfers", async () => {
    await nft.safeMint(alice.address); // id 1
    await nft.connect(alice).setApprovalForAll(operator.address, true);
    expect(await nft.isApprovedForAll(alice.address, operator.address)).to.equal(true);
    await nft.connect(operator).transferFrom(alice.address, bob.address, 1);
    expect(await nft.ownerOf(1)).to.equal(bob.address);
  });

  it("tokenURI returns base + id and reverts for nonexistent", async () => {
    await nft.safeMint(alice.address); // id 1
    expect(await nft.tokenURI(1)).to.equal(BASE + "1");
    await expect(nft.tokenURI(99)).to.be.reverted;
  });

  it("pausing stops transfers and minting", async () => {
    await nft.pause();
    await expect(nft.safeMint(alice.address)).to.be.reverted;
    // unpause and mint
    await nft.unpause();
    await nft.safeMint(alice.address);
    // pause prevents transfers
    await nft.pause();
    await expect(nft.connect(alice).transferFrom(alice.address, bob.address, 1)).to.be.reverted;
  });

  it("burn updates totalSupply and ownership", async () => {
    await nft.safeMint(alice.address); // id 1
    expect(await nft.totalSupply()).to.equal(1);
    await nft.connect(alice).burn(1);
    expect(await nft.totalSupply()).to.equal(0);
    await expect(nft.ownerOf(1)).to.be.reverted;
  });

  it("events for approval and transfer work when revoking approvals", async () => {
    await nft.safeMint(alice.address); // id 1
    await nft.connect(alice).approve(bob.address, 1);
    expect(await nft.getApproved(1)).to.equal(bob.address);
    // revoke
    await nft.connect(alice).approve(ethers.ZeroAddress, 1);
    expect(await nft.getApproved(1)).to.equal(ethers.ZeroAddress);
  });

  it("gas: mint + transfer gasUsed is reasonable", async () => {
    const txMint = await nft.safeMint(alice.address);
    const rcMint = await txMint.wait();
    const mintGas = rcMint.gasUsed;

    const txTransfer = await nft.connect(alice).transferFrom(alice.address, bob.address, 1);
    const rcTransfer = await txTransfer.wait();
    const transferGas = rcTransfer.gasUsed;

    expect(mintGas).to.be.lessThan(200000);
    expect(transferGas).to.be.lessThan(150000);
  });
});
