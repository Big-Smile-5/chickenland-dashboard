import React, { useState, useEffect } from 'react'
import eventBus from '../Components/EventBus'

function Header() {

    const [isConnected, setIsConnected] = useState(false)
    const [address, setAddress] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    const convertAddresstoName = (addr) => {
        const len = address.length
        return addr.slice(0, 5) + '...' + address.slice(len - 5, len)
    }

    const emitConnectWallet = () => {
        eventBus.dispatch('walletConnection', {})
    }

    const onConnectWallet = (data) => {
        setIsConnected(true)
        setAddress(data.address)
    }

    useEffect(() => {
        eventBus.on('walletConnected', (data) => {
            onConnectWallet(data)
        })

        return () => {
            eventBus.remove('walletConnected', (data) => {
                onConnectWallet(data)
            })  
        }
    }, [])

    return (
        <nav className="bg-white relative flex flex-wrap items-center justify-between w-full px-2 navbar-expand-lg bg-primary-light">
            <div className="container px-5 mx-auto flex flex-wrap items-center justify-between">
                <div className="w-full relative flex justify-between lg:w-auto  px-4 lg:static lg:block lg:justify-start">
                    <a className="inline-block h-20 md:h-24 py-2" href="/">
                        <img className='h-full object-contain' src='/images/logo.png' alt='logo_img' />
                    </a>
                    <button className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
                            onClick={() => {setIsOpen(!isOpen)}}>
                        <span className="block relative w-5 h-px rounded-sm bg-black"></span>
                        <span className="block relative w-5 h-px rounded-sm bg-black mt-1"></span>
                        <span className="block relative w-5 h-px rounded-sm bg-black mt-1"></span>
                    </button>
                </div>
                <div className={`flex flex-col flex-grow items-center place-items-center overflow-hidden space-y-3 py-2 transition-all duration-500 lg:py-0 lg:space-y-0 lg:space-x-8 lg:flex-row
                                    ${isOpen === true?'desktop-min:max-h-96':'desktop-min:max-h-0'}`}>
                    <ul className="flex flex-row list-none lg:ml-auto">
                        <li className="nav-item">
                            <a className="px-3 py-2 flex items-center text-xs uppercase leading-snug text-white hover:opacity-75"
                                href='https://twitter.com/' target="_blank" rel="noopener noreferrer">
                                <span className='text-gray-600 text-xl cursor-pointer'>
                                    <i className='fab fa-twitter'></i>
                                </span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="px-3 py-2 flex items-center text-xs uppercase leading-snug text-white hover:opacity-75"
                                href='https://telegram.com/' target="_blank" rel="noopener noreferrer">
                                <span className='text-gray-600 text-xl cursor-pointer'>
                                    <i className='fab fa-telegram'></i>
                                </span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="px-3 py-2 flex items-center text-xs uppercase leading-snug text-white hover:opacity-75"
                                href='https://discord.gg/' target="_blank" rel="noopener noreferrer">
                                <span className='text-gray-600 text-xl cursor-pointer'>
                                    <i className='fab fa-discord'></i>
                                </span>
                            </a>
                        </li>
                    </ul>
                    {/* <button className="bg-red-400 text-white hover:bg-lightBlue-600 font-bold uppercase text-sm px-6 py-3 rounded-2xl shadow hover:shadow-lg hover:opacity-75 outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">
                        BUY $CORN
                    </button> */}
                    <button className="bg-red-400 text-white hover:bg-lightBlue-600 font-bold uppercase text-sm px-6 py-3 rounded-2xl shadow hover:shadow-lg hover:opacity-75 outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                            onClick={() => emitConnectWallet()}
                            type="button">
                        { isConnected === true ? convertAddresstoName(address) : "Connect wallet" }
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Header