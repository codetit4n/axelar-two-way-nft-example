import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import deployment_info from '../blockchain-data/latest_addresses.json';
import ReceiverJSON from '../blockchain-data/contracts/Receiver.sol/Receiver.json'
import LyncNftContractJSON from '../blockchain-data/contracts/LyncNftContract.sol/LyncNftContract.json'

function Receiver() {
    const [loader, setLoader] = useState(false);
    const [currentAddress, setAddress] = useState(null);
    const [chainId, setChainId] = useState(null);

    useEffect(() => {
        loadWeb3();
        checkChain();
    }, [])
    const checkChain = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x507' }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0x507',
                                chainName: 'Moonbase Alpha',
                                rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
                                nativeCurrency: {
                                    name: 'DEV',
                                    symbol: 'DEV',
                                    decimals: 18
                                },
                                blockExplorerUrls: ['https://moonbase.moonscan.io']
                            },
                        ],
                    });
                } catch (addError) {
                    // handle "add" error
                    console.error(addError);
                    alert('Something unexpected happened. Check console!')
                }
            }
        }
    }
    useEffect(() => {
        window.ethereum.on('chainChanged', async function (accounts) {
            window.location.reload()
        })
    }, [])
    useEffect(() => {
        window.ethereum.on('accountsChanged', async function (accounts) {
            window.location.reload()
        })
    }, [])

    const loadWeb3 = async () => {
        setLoader(true);
        try {
            await window.ethereum.enable()
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            // find chain id
            setChainId(network.chainId)
            const signer = provider.getSigner()
            setAddress(await signer.getAddress())
        } catch (err) {
            console.log(err);
        }
        setLoader(false);
    }

    if (loader) {
        return <h1 style={{ 'textAlign': 'center' }}>Loading...</h1>
    }
    // make sure you are on the right chain
    if (chainId != '1287' && currentAddress != null) {
        return <h1 style={{ textAlign: 'center' }}>Please switch network to Moonbase Alpha testnet</h1>
    }
    return (
        <h1 style={{ 'textAlign': 'center' }}>Receiver</h1>
    )
}

export default Receiver