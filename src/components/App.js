import React, {Component} from 'react';
import Web3 from 'web3';
import './App.css';
import Navbar from './Navbar';
import Main from './Main';
import Tether from '../truffle_abis/Tether.json';
import Reward from '../truffle_abis/Reward.json';
import DecentralBank from '../truffle_abis/DecentralBank.json';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '0x0',
      tether: {},
      reward: {},
      decentralBank: {},
      tetherBalance: '0',
      rewardBalance: '0',
      stakingBalance: '0',
      loading: true,
    }
  }

  async UNSAFE_componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('No ethereum browser detected! You can check out MetaMask!');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const account = await web3.eth.getAccounts();

    this.setState({account: account[0]});

    const networkId = await web3.eth.net.getId();

    // Load Tether contract
    const tetherData = Tether.networks[networkId];
    if(tetherData) {
      const tether = new web3.eth.Contract(Tether.abi, tetherData.address);
      this.setState({tether});

      let tetherBalance = await tether.methods.balanceOf(this.state.account).call();
      this.setState({tetherBalance: tetherBalance.toString()});
    } else {
      console.log('Error! Tether contract not deployed - no detected network');
    }

    // Load Reward Contract
    const rewardData = Reward.networks[networkId];
    if(rewardData) {
      const reward = new web3.eth.Contract(Reward.abi, rewardData.address);
      this.setState({reward});

      let rewardBalance = await reward.methods.balanceOf(this.state.account).call();
      this.setState({rewardBalance: rewardBalance.toString()});
    } else {
      console.log('Error! Reward contract not deployed - no detected network');
    }

    // Load DecentralBank Contract
    const decentralBankData = DecentralBank.networks[networkId];
    if (decentralBankData) {
      const decentralBank = new web3.eth.Contract(DecentralBank.abi, decentralBankData.address);
      this.setState({decentralBank});

      let stakingBalance = await decentralBank.methods.stakingBalance(this.state.account).call();
      this.setState({stakingBalance: stakingBalance.toString()});
    } else {
      console.log('Error! Reward contract not deployed - no detected network');
    }

    this.setState({loading: false});
  }

  // stake tokens
  stakeTokens = (amount) => {
    this.setState({loading: true });
    this.state.tether.methods.approve(this.state.decentralBank._address, amount).send({from: this.state.account}).on('transactionHash', (hash) => {
      this.state.decentralBank.methods.depositToken(amount).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({loading: false });
      });
    });
  } 

  // unstake tokens
  unstakeTokens = () => {
    this.setState({loading: true });
    this.state.decentralBank.methods.unstakeTokens().send({from: this.state.account}).on('transactionHash', (hash) => {
      this.setState({loading: false });
    });
  }


  render() {
    let content;
    /* eslint-disable no-lone-blocks */
    {this.state.loading 
      ? content = <p id="loader" className='text-center' style={{color:'white', margin:'30px'}}>LOADING PLEASE...</p> 
      : content = 
        <Main
          tetherBalance={this.state.tetherBalance}
          rewardBalance={this.state.rewardBalance}
          stakingBalance={this.state.stakingBalance}
          stakeTokens={this.stakeTokens}
          unstakeTokens={this.unstakeTokens}
          decentralBankContract={this.decentralBank}
        />
      }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px', minHeight: '100vm'}}>
              <div>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;