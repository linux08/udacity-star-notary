const { assert } = require("console");

const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it("can add the token name and token symbol properly", async () => {
  let instance = await StarNotary.deployed();
  let contractName = await instance.name();
  let contractSymbol = await instance.symbol();
  assert.equal(contractName, "STAR");
  assert.equal(contractSymbol, "STR");
});

it("lets 2 users exchange stars", async () => {
  let instance = await StarNotary.deployed();
  let account0 = accounts[0];
  let account1 = accounts[1];
  let starId1 = 1;
  let starId2 = 2;

  await instance.createStar("StarUser1", starId1, { from: account0 });
  await instance.createStar("StarUser2", starId2, { from: account1 });
  await instance.approve(account1, starId1, { from: account0 });
  await instance.approve(account0, starId2, { from: account1 });
  await instance.exchangeStars(starId1, starId2, { from: account0 });
  let star1 = await instance.ownerOf.call(starId1);
  let star2 = await instance.ownerOf.call(starId2);
  assert.equal(star1, account1);
  assert.equal(star2, account0);
});

it("lets a user transfer a star", async () => {
  // 1. create a Star with different tokenId
  // 2. use the transferStar function implemented in the Smart Contract
  // 3. Verify the star owner changed.

  let instance = await StarNotary.deployed();
  let account0 = accounts[0];
  let account1 = accounts[1];
  let starId = 1;

  await instance.createStar("Star", starId, { from: account0 });
  await instance.transferStar(user2, starId, { from: account1 });
  let starUser = await instance.ownerOf.call(starId);
  assert.equal(starUser, account1);
});

it("lookUp star token ID", async () => {
  let account0 = accounts[0];
  let instance = await StarNotary.deployed();
  let starId = 1;
  let tokenName = "StarTok";
  await instance.createStar(tokenName, starId1, { from: account0 });

  let toks = instance.lookUptokenIdToStarInfo(starId);
  assert(toks, tokenName);
});
