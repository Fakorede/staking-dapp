pragma solidity ^0.5.0;

import './Reward.sol';
import './Tether.sol';

contract DecentralBank {
  string public name = 'Decentral Bank';
  address public owner;
  Tether public tether;
  Reward public reward;

  address[] public stakers;

  mapping(address => uint) public stakingBalance;
  mapping(address => bool) public hasStaked;
  mapping(address => bool) public isStaking;

  constructor(Reward _reward, Tether _tether) public {
    reward = _reward;
    tether = _tether;
    owner = msg.sender;
  }

  function depositToken(uint _amount) public {
    require(_amount > 0, 'Amount cannot be zero.');

    // Transfer mock tether to this contract address for staking
    tether.transferFrom(msg.sender, address(this), _amount);

    // update staking balance
    stakingBalance[msg.sender] += _amount; 

    if (!hasStaked[msg.sender]) {
      stakers.push(msg.sender);
    }

    isStaking[msg.sender] = true;
    hasStaked[msg.sender] = true;
  }

  function unstakeTokens() public {
    uint balance = stakingBalance[msg.sender];
    require(balance > 0, 'staking balace cant be less than zero');

    // transfer mock tether back to address
    tether.transfer(msg.sender, balance);

    // reset staking balance
    stakingBalance[msg.sender] = 0;

    // update status
    isStaking[msg.sender] = false;
  }

  // issue rewards
  function issueTokens() public {
    require(msg.sender == owner, 'caller must be the owner');
    for (uint i=0; i < stakers.length; i++) {
      address recipient = stakers[i];
      uint balance = stakingBalance[recipient] / 9; // create percentage incentive

      if (balance > 0) {
        reward.transfer(recipient, balance);
      }
    }
  }
}