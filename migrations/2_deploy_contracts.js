const Tether = artifacts.require('Tether');
const Reward = artifacts.require('Reward');
const DecentralBank = artifacts.require('DecentralBank');

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Tether);
  const tether = await Tether.deployed();

  await deployer.deploy(Reward);
  const reward = await Reward.deployed();

  await deployer.deploy(DecentralBank, reward.address, tether.address);
  const decentralBank = await DecentralBank.deployed();

  // Transfer Reward Tokens to DecentralBank
  await reward.transfer(decentralBank.address, '1000000000000000000000000');

  // distribute 100 tether to investors
  await tether.transfer(accounts[1], '100000000000000000000')
}