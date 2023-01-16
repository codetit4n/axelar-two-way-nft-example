import React, { useState, useEffect } from 'react'
import './styles.css'
import { ethers } from 'ethers';
import deployment_info from '../blockchain-data/latest_addresses.json';
// import ReceiverJSON from '../blockchain-data/contracts/Receiver.sol/Receiver.json'
import LyncNftContractJSON from '../blockchain-data/contracts/LyncNftContract.sol/LyncNftContract.json'

function Receiver() {
    const [loader, setLoader] = useState(false);
    const [currentAddress, setAddress] = useState(null);
    const [chainId, setChainId] = useState(null);

    useEffect(() => {
        loadWeb3();
    }, [])
    const switchChain = async () => {
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

    const [addrInputMint, setAddrInputMint] = useState(null)
    const [addrInputChk, setAddrInputChk] = useState(null)

    const handleMint = async (e) => {
        e.preventDefault();
        setLoader(true);
        const regex = /^0x[a-fA-F0-9]{40}$/
        if (regex.test(addrInputMint)) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner()
                const contract = new ethers.Contract(deployment_info.TestNft.address, LyncNftContractJSON.abi, signer);
                await contract.safeMint(addrInputMint);
            } catch (err) {
                console.log(err);
            }
        } else {
            alert('Invalid input!!!');
        }
        setLoader(false);
    }

    const changeAddrInputMint = (e) => {
        setAddrInputMint(e.target.value)
    }
    const changeAddrInputChk = (e) => {
        setAddrInputChk(e.target.value)
    }
    const handleCheckOwnership = (e) => {
        e.preventDefault();
        setLoader(true);
        setLoader(false);
    }
    // make sure you are on the right chain
    if (chainId != '1287' && currentAddress != null) {
        switchChain();
        return <h1>Please switch network to Moonbase Alpha testnet</h1>
    }
    if (loader) {
        return <h1>Loading...</h1>
    }
    return (
        <>
            <h1>Moonbase Alpha chain</h1>
            <hr />
            <h2>Mint NFT on Moonbase Alpha chain</h2>
            <form>
                <input type="text" placeholder='Enter address' onChange={changeAddrInputMint} />
                <input type="button" value="Mint" onClick={handleMint} />
            </form>
            <hr />
            <h2>Check ownership of an NFT on this chain</h2>
            <form>
                <input type="text" placeholder='Enter address' onChange={changeAddrInputChk} />
                <input type="button" value="Check" onClick={handleCheckOwnership} />
            </form>
            <hr />
        </>

    )
}

export default Receiver