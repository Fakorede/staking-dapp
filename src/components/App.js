import React, {Component} from 'react';
import Web3 from 'web3';
import './App.css';
import Navbar from './Navbar';

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
      loading: false,
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

    this.setState({
      account: account[0],
    });
  }


  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div>Hello</div>
      </div>
    );
  }
}

export default App;