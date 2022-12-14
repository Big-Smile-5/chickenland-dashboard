import React, { useState, useEffect } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import eventBus from './EventBus'

function Home() {

    const [isConnected, setIsConnected] = useState(false)
    const [referral, setReferral] = useState('')
    const [text, setText] = useState('Copy Link')
    const [amount, setAmount] = useState(0)
    const [nativeBalance, setNativeBalance] = useState(0)
    const [contractBalance, setContractBalance] = useState(0)
    const [chickenBalance, setChickenBalance] = useState(0)
    const [eggBalance, setEggBalance] = useState(0)
    const [cornBalance, setCornBalance] = useState(0)
    const [claimableNative, setClaimableNative] = useState(0)
    const [isAutoCompound, setIsAutoCompound] = useState(true)
    const [payDay, setPayDay] = useState(3)
    const [currentStrategy, setCurrentStrategy] = useState(0)
    const [isInAutoCompound, setIsInAutoCompound] = useState(false)

    const onConnectWallet = (data) => {
        let url = window.location.href
        if(url.indexOf('ref') !== -1) {
            url = url.slice(0, url.indexOf('ref') - 1)
        }
        setIsConnected(true)
        setReferral(url + '?ref=' + data.address)
    }

    const onStateUpdated = (data) => {
        setCornBalance(data.cornBalance)
        setNativeBalance(data.nativeBalance)
        setContractBalance(data.contractBalance)
        setChickenBalance(data.chickenBalance)
        setEggBalance(data.eggBalance)
        setClaimableNative(data.claimableNative)
        setCurrentStrategy(data.currentStrategy)
        setIsInAutoCompound(data.isAutoCompound)
    }

    const emitBuyChicken = () => {
        if(amount === 0) return
        eventBus.dispatch('buyChicken', {
            amount
        })
    }

    const emitHatchEggs = () => {
        eventBus.dispatch('hatch', {})
    }

    const emitSellEggs = () => {
        eventBus.dispatch('sell', {})
    }

    const emitSetAutoCompound = () => {
        if(parseInt(payDay) >= 1 && parseInt(payDay) <= 1000) {
            eventBus.dispatch('setAutoCompound', {
                isAutoCompound,
                payDay
            })   
        }
    }

    const showTooltip = () => {
        setText('Copied!')
        setTimeout(() => {
            setText('Copy Link')
        }, 2000)
    }

    useEffect(() => {
        eventBus.on('walletConnected', (data) => {
            onConnectWallet(data)
        })
        eventBus.on('stateUpdated', (data) => {
            onStateUpdated(data)
        })

        return () => {
            eventBus.remove('walletConnected', (data) => {
                onConnectWallet(data)
            })  
        }
    }, [])

    return (
        <section className='relative w-full'>
            <div className='w-full h-full absolute'>
                <img className='h-full object-cover lg:h-auto' src="./images/background.jpg" alt="back_img"></img>
            </div>
            <div className='relative flex flex-wrap justify-center w-full py-20'>
                <div className='flex flex-col place-items-center w-22rem bg-primary text-white shadow-2xl drop-shadow-2xl space-y-5 px-4 py-7 rounded-xl mx-3 my-2 tab'>
                    <h1 className='text-3xl pb-3'>Referral</h1>
                    <input className='w-4/5 px-5 py-2 border border-dark-blue rounded-sm text-gray-600 outline-none' type="text" defaultValue={isConnected === true ?referral:''} placeholder='Your referral link...' />
                    <CopyToClipboard text={referral} onCopy={() => showTooltip()}>
                        <button className='bg-dark-blue px-5 py-2 rounded-lg shadow-md'>{text}</button>
                    </CopyToClipboard>
                    <ul className='space-y-3'>
                        <li>Earn 10% of the BNB used to hire Chickens from anyone who uses your referral link.</li>
                        <li>9:1 Optimal strategy to get the best return is to Hatch your Eggs (Compound) for 9 days straight and Sell your Eggs (Claim) on the 10th day, each week. If you Claim more frequently, you will get fewer and fewer rewards daily.</li>
                    </ul>
                </div>

                <div className='flex flex-col place-items-center w-22rem bg-primary text-white shadow-2xl drop-shadow-2xl space-y-5 px-8 py-7 mx-3 my-2 rounded-xl'>
                    <h1 className='text-3xl pb-3'>Your Egg Value</h1>
                    <div className='flex justify-between w-full'>
                        <h1>Contract</h1>
                        <h1>{contractBalance} BNB</h1>
                    </div>
                    <div className='flex justify-between w-full'>
                        <h1>Wallet</h1>
                        <h1>{nativeBalance} BNB</h1>
                    </div>
                    <div className='flex justify-between w-full'>
                        <h1>Your Chickens</h1>
                        <h1>{chickenBalance}</h1>
                    </div>
                    <div className='flex justify-between w-full'>
                        <h1>Your Corn</h1>
                        <h1>{cornBalance}</h1>
                    </div>
                    <input className='w-full px-5 py-2 border border-dark-blue rounded-sm text-gray-600 text-right outline-none'
                           type="text"
                           onChange={(e) => setAmount(e.target.value)}
                           placeholder='0 BNB' />
                    <div className='flex justify-between w-full'>
                        <button className='uppercase bg-dark-blue px-5 py-2 rounded-lg shadow-md'
                                onClick={() => emitBuyChicken()}>buy chickens</button>
                        <a className='uppercase bg-dark-blue px-5 py-2 rounded-lg shadow-md'
                            href='https://chickenland.io/#buycorn' target="_blank" rel="noopener noreferrer"
                                >BUY $CORN</a>
                    </div>
                    <div className='flex justify-between w-full'>
                        <h1>Your Rewards</h1>
                        <h1>{eggBalance} Eggs ({claimableNative} BNB)</h1>
                    </div>
                    <div className='flex justify-between w-full'>
                        <button className="uppercase bg-dark-blue px-5 py-2 rounded-lg shadow-md"
                                onClick={() => emitHatchEggs()}>hatch eggs</button>
                        <button className="uppercase bg-dark-blue px-5 py-2 rounded-lg shadow-md"
                                onClick={() => emitSellEggs()}>sell eggs</button>
                    </div>
                </div>

                <div className='flex flex-col place-items-center w-22rem bg-primary text-white shadow-2xl drop-shadow-2xl space-y-5 px-8 py-7 mx-3 my-2 rounded-xl'>
                    <h1 className='text-3xl pb-3'>Chicken Land Facts</h1>
                    <div className='flex justify-between w-full'>
                        <h1>Daily Return</h1>
                        <h1>9%</h1>
                    </div>
                    <div className='flex justify-between w-full'>
                        <h1>APR</h1>
                        <h1>3,285%</h1>
                    </div>
                    <div className='flex justify-between w-full'>
                        <h1>Marketing Fee</h1>
                        <h1>2%</h1>
                    </div>
                    <div className='flex justify-between w-full'>
                        <h1>Dev Fee</h1>
                        <h1>2%</h1>
                    </div>
                    <div className='flex justify-between w-full'>
                        <h1>Current Strategy</h1>
                        { isInAutoCompound === true
                           ? <h1>{currentStrategy} : 1</h1>
                           : <h1>No strategy</h1>
                        }
                    </div>
                    <div className='flex justify-between w-full space-x-3'>
                        <h1>Sell Eggs Every X Days</h1>
                        <input className='w-1/2 px-3 py-2 border border-dark-blue rounded-sm text-gray-600 text-right outline-none'
                           type="text"
                           onChange={(e) => setPayDay(e.target.value)}
                           placeholder='3' />
                    </div>
                    <div className='flex justify-between w-full'>
                        <div>
                            <input type="checkbox" onChange={(e) => setIsAutoCompound(e.target.checked)} defaultChecked />
                            <label className='px-2'>Auto Compound</label>
                        </div>
                    </div>
                    <button className="uppercase bg-dark-blue px-5 py-2 rounded-lg shadow-md"
                            onClick={() => emitSetAutoCompound()}>Apply Strategy</button>
                    <div className='w-full'>
                        <h1>Chicken needs to eat BitCORN in order to provide maximum Daily Returns.</h1>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Home