import React from 'react';
// import { Redirect } from 'react-router-dom'
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import eventBus from './Components/EventBus';
import contractInfo from './contractInfo'

import Header from './Layouts/Header';
import Home from './Components/Home';
import './App.css';

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

let web3, contract, contractAddress;

class Container extends React.Component {

  constructor() {
    super()

    this.state = {
      address: '',
      nativeBalance: 0,
      isConnected: false,
      referrer: '0x0000000000000000000000000000000000000000',
      contractBalance: 0,
      chickenBalance: 0,
      claimableNative: 0,
      currentStrategy: 0
    }

    this.connectWallet = this.connectWallet.bind(this)
    this.scanConnectedWallet = this.scanConnectedWallet.bind(this)
    this.displayNotification = this.displayNotification.bind(this)
  }

  connectWallet() {
    if (window.ethereum) {
      (async () => {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // await window.ethereum.request({
        //   method: 'wallet_switchEthereumChain',
        //   params: [{ chainId: '0x97' }]
        // });

        let accounts = await web3.eth.getAccounts();
        let nativeBalance = await web3.eth.getBalance(accounts[0]);
        
        this.setState({
          address: accounts[0],
          nativeBalance: nativeBalance,
          isConnected: true
        })
        
        eventBus.dispatch('walletConnected', { 
          'address': accounts[0],
          'nativeBalance': nativeBalance
        })
      })()
    } else {
      alert('Install Metamask please.');
    }
  }

  scanConnectedWallet() {
    if(this.state.isConnected === true) return;

    web3.eth.getAccounts(async (err, accounts) => {
        if (err != null) {
            console.error("An error occurred: " + err)
        } else if (accounts.length !== 0 ) {
            let nativeBalance = await web3.eth.getBalance(accounts[0]);

            this.setState({
              address: accounts[0],
              nativeBalance: nativeBalance,
              isConnected: true
            })

            eventBus.dispatch('walletConnected', { 
              'address': accounts[0],
              'nativeBalance': nativeBalance
            })
        }
    })
  }

  buyChicken = (data) => {
    console.log(data)
    contract.methods.adoptChickens(this.state.referrer).send({
      from: this.state.address,
      to: contractInfo.address,
      value: web3.utils.toWei(data.amount, 'ether')
    }).then(() => {
      this.displayNotification('success', 'Success!')
      eventBus.dispatch('updateState', {})
    }).catch(() => {
      this.displayNotification('warning', 'insufficient Balance!')
    })
  }

  hatchEggs = () => {
    contract.methods.hatchEggs().send({
      from: this.state.address,
      to: contractInfo.address,
    }).then(() => {
      this.displayNotification('success', 'Success!')
      eventBus.dispatch('updateState', {})
    }).catch(() => {
      this.displayNotification('warning', 'Network Error!')
    })
  }

  sellEggs = () => {
    contract.methods.sellEggs().send({
      from: this.state.address,
      to: contractInfo.address,
    }).then(() => {
      this.displayNotification('success', 'Success!')
      eventBus.dispatch('updateState', {})
    }).catch(() => {
      this.displayNotification('warning', 'Network Error!')
    })
  }

  setAutoCompound = (data) => {
    contract.methods.setMyAutoCompound(data.isAutoCompound, data.payDay).send({
      from: this.state.address,
      to: contractInfo.address,
    }).then(() => {
      this.displayNotification('success', 'Success!')
      eventBus.dispatch('updateState', {})
    }).catch(() => {
      this.displayNotification('warning', 'Network Error!')
    })
  }

  getReferrer = () => {
    let url = window.location.href
    if(url.indexOf('ref')) {
      let referrer = url.slice(url.indexOf('ref') + 4, url.length)
      console.log(referrer)
      // url = url.slice(0, url.indexOf('/'))
    }
    // return <Redirect to={url} />
  }

  displayNotification(appearance, text) {

    switch(appearance) {
        case 'warning':
            toast.warn(text)
            break
        case 'info':
            toast.info(text)
            break
        case 'error':
            toast.error(text)
            break
        case 'success':
            toast.success(text)
            break
        default:
            break
    }
  }

  updateState = async () => {
    if(this.state.isConnected === false) return

    let chickenBalance = await contract.methods.getEggsOfAccount(this.state.address).call()
    let claimableNative = await contract.methods.getClaimableEthOfAccount(this.state.address).call()
    let currentStrategy = await contract.methods.payoutDays(this.state.address).call()
    let contractBalance = await web3.eth.getBalance(contractInfo.address)

    this.setState({
      ...this.state,
      chickenBalance,
      contractBalance,
      claimableNative,
      currentStrategy
    })
    eventBus.dispatch('stateUpdated', {
      nativeBalance: parseFloat(web3.utils.fromWei(this.state.nativeBalance, 'ether')).toFixed(4),
      chickenBalance,
      contractBalance: parseFloat(web3.utils.fromWei(contractBalance, 'ether')).toFixed(4),
      claimableNative: parseFloat(web3.utils.fromWei(claimableNative, 'ether')).toFixed(4),
      currentStrategy
    })
  }

  componentDidMount() {
    if(window.ethereum) {
      web3 = new Web3(window.ethereum)
      contractAddress = contractInfo.address
      contract = new web3.eth.Contract(contractInfo.abi, contractInfo.address)

      this.scanConnectedWallet()
    }

    this.getReferrer()
    this.timeId = setInterval(() => {
      this.updateState()
    }, 30000)

    eventBus.on('walletConnection', () => {
      this.connectWallet()
    })
    eventBus.on('walletConnected', () => {
      this.updateState()
    })
    eventBus.on('buyChicken', (data) => {
      if(this.state.isConnected === false) {
        this.displayNotification('info', 'Please connect wallet.')
        return
      }
      this.buyChicken(data)
    })
    eventBus.on('hatch', () => {
      if(this.state.isConnected === false) {
        this.displayNotification('info', 'Please connect wallet.')
        return
      }
      this.hatchEggs()
    })
    eventBus.on('sell', () => {
      if(this.state.isConnected === false) {
        this.displayNotification('info', 'Please connect wallet.')
        return
      }
      this.sellEggs()
    })
    eventBus.on('setAutoCompound', (data) => {
      if(this.state.isConnected === false) {
        this.displayNotification('info', 'Please connect wallet.')
        return
      }
      this.setAutoCompound(data)
    })
    eventBus.on('updateState', () => {
      this.updateState()
    })

    return () => {
      eventBus.remove('walletConnection', () => {
        this.connectWallet()
      })
      eventBus.remove('walletConnected', () => {
        this.updateState()
      })
      eventBus.remove('buyChicken', (data) => {
        if(this.state.isConnected === false) {
          this.displayNotification('info', 'Please connect wallet.')
          return
        }
        this.buyChicken(data)
      })
      eventBus.remove('hatch', () => {
        if(this.state.isConnected === false) {
          this.displayNotification('info', 'Please connect wallet.')
          return
        }
        this.hatchEggs()
      })
      eventBus.remove('sell', () => {
        if(this.state.isConnected === false) {
          this.displayNotification('info', 'Please connect wallet.')
          return
        }
        this.sellEggs()
      })
      eventBus.remove('setAutoCompound', (data) => {
        if(this.state.isConnected === false) {
          this.displayNotification('info', 'Please connect wallet.')
          return
        }
        this.setAutoCompound(data)
      })
      eventBus.remove('updateState', () => {
        this.updateState()
      })
    }
  }

  // componentWillUnmount() {
  //   clearInterval(this.timeId)
  // }

  render() {
    return (
      <div className="relative">
        <ToastContainer />
        <div className='w-full shadow-xl'>
          <Header />
        </div>
        <Home />
      </div>
    )
  }
}

function App() {

  return (
    <Container />
  );
}

export default App;
