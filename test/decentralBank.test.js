const Tether = artifacts.require('Tether');
const Reward = artifacts.require('Reward');
const DecentralBank = artifacts.require('DecentralBank');

require('chai').use(require('chai-as-promised')).should();

contract('decentralBank', ([owner, customer]) => {
  let tether, reward, decentralBank;

  function tokens(number) {
    return web3.utils.toWei(number, 'ether');
  }

  before(async () => {
    // init
    tether = await Tether.new();
    reward = await Reward.new();
    decentralBank = await DecentralBank.new(reward.address, tether.address);

    // transfer reward tokens to decentralBank
    await reward.transfer(decentralBank.address, tokens('1000000'));

    // transfer 100 mock tethers to customer
    await tether.transfer(customer, tokens('100'), {from: owner});
  })

  describe('Mock Tether Deployment', async () => {
    it('matches name successfully', async () => {
      const name = await tether.name();
      assert.equal(name, 'Mock Tether');
    })
  })

  describe('Reward Token Deployment', async () => {
    it('matches name successfully', async () => {
      const name = await reward.name();
      assert.equal(name, 'Reward Token');
    })
  })

  describe('Decentral Bank Deployment', async () => {
    it('matches name successfully', async () => {
      const name = await decentralBank.name();
      assert.equal(name, 'Decentral Bank');
    })

    it('contract has tokens', async () => {
      let balance = await reward.balanceOf(decentralBank.address)
      assert.equal(balance, tokens('1000000'))
    })
  })

  describe('Yield Farming', async () => {
    it('reward tokens for staking', async () => {
      let result;

      // check investor balance
      result = await tether.balanceOf(customer)
      assert.equal(result, tokens('100'), 'csutomer mock wallet balance before staking')

      // check staking for investor
      await tether.approve(decentralBank.address, tokens('100'), {from: customer});
      await decentralBank.depositToken(tokens('100'), {from: customer});

      // check updated balance of customer
      result = await tether.balanceOf(customer)
      assert.equal(result, tokens('0'), 'csutomer mock wallet balance after staking')

      // check updated balance of decentralbank
      result = await tether.balanceOf(decentralBank.address)
      assert.equal(result, tokens('100'), 'decentral balance after staking from customer')

      // is staking balance
      result = await decentralBank.isStaking(customer)
      assert.equal(result.toString(), 'true', 'customer isStaking status after staking')
    })
  })
})