import React from 'react';
// import { Redirect } from 'react-router-dom'
import Web3 from 'web3';
import { providers/*, ethers*/ } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
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

let web3, contract;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "e1ca38f0c58f4681bf723d6ebb6da5d2", // required
    }
  }
}

let web3Modal
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
    theme: "dark",
  });
}

class Container extends React.Component {

  constructor() {
    super()

    this.state = {
      address: '',
      nativeBalance: 0,
      isConnected: false,
      referrer: '0x0000000000000000000000000000000000000000',
      contractBalance: '0',
      cornBalance: '0',
      chickenBalance: '0',
      claimableNative: '0',
      currentStrategy: '0',
      isAutoCompound: false,
      provider: null,
      web3Provider: null
    }

    this.connectWallet = this.connectWallet.bind(this)
    this.displayNotification = this.displayNotification.bind(this)
  }

  async connectWallet() {
    if(this.state.isConnected === true) return

    // await web3Modal.clearCachedProvider();
    const provider = await web3Modal.connect();
    const web3Provider = new providers.Web3Provider(provider)
    const signer = web3Provider.getSigner()
    const account = await signer.getAddress()
    const nativeBalance = (await signer.getBalance()).toString()

    web3 = new Web3(provider)
    contract = new web3.eth.Contract(contractInfo.abi, contractInfo.address)

    if(await web3.eth.getChainId() !== 56) {
      await web3Provider.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }]
      });
    }

    this.setState({
      address: account,
      nativeBalance: nativeBalance,
      isConnected: true,
      provider,
      web3Provider
    }, () => {
      this.state.provider.on("accountsChanged", this.handleAccountsChanged)
      this.state.provider.on("chainChanged", this.handleChainChanged)
      eventBus.dispatch('walletConnected', { 
        'address': account,
        'nativeBalance': nativeBalance
      })
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
    if(url.indexOf('ref') !== -1) {
      let referrer = url.slice(url.indexOf('ref') + 4, url.length)
      console.log(referrer)
      this.setState({
        ...this.state,
        referrer
      })
    }
    // return <Redirect to={url} />
  }

  displayNotification(appearance, text) {

    switch(appearance) {
        case 'warning':
            toast.warn(text); break
        case 'info':
            toast.info(text); break
        case 'error':
            toast.error(text); break
        case 'success':
            toast.success(text); break
        default:
            break
    }
  }

  updateState = async () => {
    if(this.state.isConnected !== true) return
    
    contract.methods.chickens(this.state.address).call()
      .then((chickenBalance) => {
        this.setState({
          ...this.state,
          chickenBalance
        })
        
        eventBus.dispatch('stateUpdated', {
          nativeBalance: parseFloat(web3.utils.fromWei(this.state.nativeBalance, 'ether')).toFixed(4),
          chickenBalance,
          eggBalance: this.state.eggBalance,
          contractBalance: parseFloat(web3.utils.fromWei(this.state.contractBalance, 'ether')).toFixed(4),
          claimableNative: parseFloat(web3.utils.fromWei(this.state.claimableNative, 'ether')).toFixed(4),
          currentStrategy: this.state.currentStrategy,
          cornBalance: this.state.cornBalance,
          isAutoCompound: this.state.isAutoCompound
        })
      })
    contract.methods.getEggsOfAccount(this.state.address).call()
      .then((eggBalance) => {
        this.setState({
          ...this.state,
          eggBalance
        })
        
        eventBus.dispatch('stateUpdated', {
          nativeBalance: parseFloat(web3.utils.fromWei(this.state.nativeBalance, 'ether')).toFixed(4),
          chickenBalance: this.state.chickenBalance,
          eggBalance,
          contractBalance: parseFloat(web3.utils.fromWei(this.state.contractBalance, 'ether')).toFixed(4),
          claimableNative: parseFloat(web3.utils.fromWei(this.state.claimableNative, 'ether')).toFixed(4),
          currentStrategy: this.state.currentStrategy,
          cornBalance: this.state.cornBalance,
          isAutoCompound: this.state.isAutoCompound
        })
      })
    contract.methods.getClaimableEthOfAccount(this.state.address).call()
      .then((claimableNative) => {
        this.setState({
          ...this.state,
          claimableNative
        })
        
        eventBus.dispatch('stateUpdated', {
          nativeBalance: parseFloat(web3.utils.fromWei(this.state.nativeBalance, 'ether')).toFixed(4),
          chickenBalance: this.state.chickenBalance,
          eggBalance: this.state.eggBalance,
          contractBalance: parseFloat(web3.utils.fromWei(this.state.contractBalance, 'ether')).toFixed(4),
          claimableNative: parseFloat(web3.utils.fromWei(claimableNative, 'ether')).toFixed(4),
          currentStrategy: this.state.currentStrategy,
          cornBalance: this.state.cornBalance,
          isAutoCompound: this.state.isAutoCompound
        })
      })
    web3.eth.getBalance(contractInfo.address)
      .then((contractBalance) => {
        this.setState({
          ...this.state,
          contractBalance
        })
        
        eventBus.dispatch('stateUpdated', {
          nativeBalance: parseFloat(web3.utils.fromWei(this.state.nativeBalance, 'ether')).toFixed(4),
          chickenBalance: this.state.chickenBalance,
          eggBalance: this.state.eggBalance,
          contractBalance: parseFloat(web3.utils.fromWei(contractBalance, 'ether')).toFixed(4),
          claimableNative: parseFloat(web3.utils.fromWei(this.state.claimableNative, 'ether')).toFixed(4),
          currentStrategy: this.state.currentStrategy,
          cornBalance: this.state.cornBalance,
          isAutoCompound: this.state.isAutoCompound
        })
      })
    contract.methods.balanceOf(this.state.address).call()
      .then((cornBalance) => {
        this.setState({
          ...this.state,
          cornBalance
        })
        
        eventBus.dispatch('stateUpdated', {
          nativeBalance: parseFloat(web3.utils.fromWei(this.state.nativeBalance, 'ether')).toFixed(4),
          chickenBalance: this.state.chickenBalance,
          eggBalance: this.state.eggBalance,
          contractBalance: parseFloat(web3.utils.fromWei(this.state.contractBalance, 'ether')).toFixed(4),
          claimableNative: parseFloat(web3.utils.fromWei(this.state.claimableNative, 'ether')).toFixed(4),
          currentStrategy: this.state.currentStrategy,
          cornBalance,
          isAutoCompound: this.state.isAutoCompound
        })
      })
    contract.methods.payoutDays(this.state.address).call()
      .then((currentStrategy) => {
        this.setState({
          ...this.state,
          currentStrategy
        })
        
        eventBus.dispatch('stateUpdated', {
          nativeBalance: parseFloat(web3.utils.fromWei(this.state.nativeBalance, 'ether')).toFixed(4),
          chickenBalance: this.state.chickenBalance,
          eggBalance: this.state.eggBalance,
          contractBalance: parseFloat(web3.utils.fromWei(this.state.contractBalance, 'ether')).toFixed(4),
          claimableNative: parseFloat(web3.utils.fromWei(this.state.claimableNative, 'ether')).toFixed(4),
          currentStrategy: currentStrategy,
          cornBalance: this.state.cornBalance,
          isAutoCompound: this.state.isAutoCompound
        })
      })
    contract.methods.isAutoCompound(this.state.address).call()
      .then((isAutoCompound) => {
        this.setState({
          ...this.state,
          isAutoCompound
        })
        
        eventBus.dispatch('stateUpdated', {
          nativeBalance: parseFloat(web3.utils.fromWei(this.state.nativeBalance, 'ether')).toFixed(4),
          chickenBalance: this.state.chickenBalance,
          eggBalance: this.state.eggBalance,
          contractBalance: parseFloat(web3.utils.fromWei(this.state.contractBalance, 'ether')).toFixed(4),
          claimableNative: parseFloat(web3.utils.fromWei(this.state.claimableNative, 'ether')).toFixed(4),
          currentStrategy: this.state.currentStrategy,
          cornBalance: this.state.cornBalance,
          isAutoCompound
        })
      })

    // let chickenBalance = await contract.methods.chickens(this.state.address).call()
    // let eggBalance = await contract.methods.getEggsOfAccount(this.state.address).call()
    // let claimableNative = await contract.methods.getClaimableEthOfAccount(this.state.address).call()
    // let currentStrategy = await contract.methods.payoutDays(this.state.address).call()
    // let contractBalance = await web3.eth.getBalance(contractInfo.address)
    // let cornBalance = await contract.methods.balanceOf(this.state.address).call()
    // let isAutoCompound = await contract.methods.isAutoCompound(this.state.address).call()

    // // console.log(isAutoCompound)

    // this.setState({
    //   ...this.state,
    //   chickenBalance,
    //   eggBalance,
    //   contractBalance,
    //   claimableNative,
    //   currentStrategy,
    //   cornBalance,
    //   isAutoCompound
    // })
    // eventBus.dispatch('stateUpdated', {
    //   nativeBalance: parseFloat(web3.utils.fromWei(this.state.nativeBalance, 'ether')).toFixed(4),
    //   chickenBalance,
    //   eggBalance,
    //   contractBalance: parseFloat(web3.utils.fromWei(contractBalance, 'ether')).toFixed(4),
    //   claimableNative: parseFloat(web3.utils.fromWei(claimableNative, 'ether')).toFixed(4),
    //   currentStrategy,
    //   cornBalance,
    //   isAutoCompound
    // })
  }

  
  handleAccountsChanged = () => {
    window.location.reload()
  }
  handleChainChanged = () => {
    window.location.reload()
  }
  disconnect = async () => {
    await web3Modal.clearCachedProvider();
    window.location.reload()
  };

  componentDidMount() {
    if(web3Modal.cachedProvider) {
      this.connectWallet()
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
    eventBus.on('disconnectWallet', () => {
      this.disconnect()
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

    // if (this.state.provider !== null) {
    //   this.state.provider.on("accountsChanged", this.handleAccountsChanged)
    //   this.state.provider.on("chainChanged", this.handleChainChanged)
    // }

    return () => {
      eventBus.remove('walletConnection', () => {})
      eventBus.remove('walletConnected', () => {})
      eventBus.remove('buyChicken', () => {})
      eventBus.remove('hatch', () => {})
      eventBus.remove('sell', () => {})
      eventBus.remove('setAutoCompound', () => {})
      eventBus.remove('updateState', () => {})

      if (this.state.provider.removeListener) {
        this.state.provider.removeListener("accountsChanged", this.handleAccountsChanged)
        this.state.provider.removeListener("chainChanged", this.handleChainChanged)
      }
      clearImmediate(this.timeId)
    }
  }

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
