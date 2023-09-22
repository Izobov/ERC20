const { expect } = require("chai");
const { ethers } = require("hardhat");
const tokenJSON = require("../artifacts/contracts/IZSToken.sol/IZSToken.json");

describe("IZShop", function () {
  let owner, buyer, shop, erc20;
  beforeEach(async () => {
    [owner, buyer] = await ethers.getSigners();
    const Shop = await ethers.getContractFactory("IZShop", owner);
    shop = await Shop.deploy();
    await shop.waitForDeployment();
    erc20 = new ethers.Contract(await shop.token(), tokenJSON.abi, owner);
  });

  it("should have an owner and token", async () => {
    console.log(shop);
    console.log(shop.owner());
    console.log(shop.token());
    expect(await shop.owner()).to.eq(owner.address);
    expect(await shop.token()).to.be.properAddress;
  });

  it("allows to buy", async () => {
    const amount = 3;
    const txData = {
      value: amount,
      to: await shop.getAddress(),
    };
    const tx = await buyer.sendTransaction(txData);
    await tx.wait();
    expect(await erc20.balanceOf(buyer.address)).to.eq(amount);
    await expect(() => tx).to.changeEtherBalance(shop, amount);
    await expect(tx).to.emit(shop, "Bought").withArgs(amount, buyer.address);
  });
  it("allows to sell", async () => {
    const amount = 3;
    const address = await shop.getAddress();
    const txData = {
      value: amount,
      to: address,
    };
    const tx = await buyer.sendTransaction(txData);
    await tx.wait();
    const sellAmount = 2;
    const approval = await erc20.connect(buyer).approve(address, sellAmount);
    await approval.wait();
    const tx2 = await shop.connect(buyer).sell(sellAmount);
    await tx2.wait();
    expect(await erc20.balanceOf(buyer.address)).to.eq(amount - sellAmount);
    await expect(() => tx2).to.changeEtherBalances(
      [shop, buyer],
      [-sellAmount, sellAmount]
    );
    await expect(tx2).to.emit(shop, "Sold").withArgs(sellAmount, buyer.address);
  });
});
