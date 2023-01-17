import React, { useState, useEffect } from 'react'
import './styles.css'
import { ethers } from 'ethers';
import deployment_info from '../blockchain-data/latest_addresses.json';
// import ReceiverJSON from '../blockchain-data/contracts/Receiver.sol/Receiver.json'
import LyncNftContractJSON from '../blockchain-data/artifacts/contracts/LyncNftContract.sol/LyncNftContract.json'

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
    const [txHash, setTxHash] = useState(null)
    const [addrInputChk, setAddrInputChk] = useState(null)
    const [contractAddrInputChk, setContractAddrInputChk] = useState(null)
    const [tokenIdInputChk, setTokenIdInputChk] = useState(null)
    const [output, setOutput] = useState(null)

    const handleMint = async (e) => {
        e.preventDefault();
        setLoader(true);
        const regex = /^0x[a-fA-F0-9]{40}$/
        if (regex.test(addrInputMint)) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner()
                const contract = new ethers.Contract(deployment_info.TestNft.address, LyncNftContractJSON.abi, signer);
                const txn = await contract.safeMint(addrInputMint);
                setTxHash(txn.hash);
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

    const changeContractAddrInputChk = (e) => {
        setContractAddrInputChk(e.target.value)
    }

    const changeTokenId = (e) => {
        setTokenIdInputChk(e.target.value)
    }
    const handleCheckOwnership = async (e) => {
        e.preventDefault();
        setLoader(true);
        const regex = /^0x[a-fA-F0-9]{40}$/
        if (regex.test(contractAddrInputChk) && regex.test(addrInputChk)) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner()
                const contract = new ethers.Contract(contractAddrInputChk, LyncNftContractJSON.abi, signer);
                const getFromBlockchain = await contract.ownerOf(tokenIdInputChk);
                if (getFromBlockchain.toLowerCase() === addrInputChk.toLowerCase()) {
                    setOutput('YES')
                } else {
                    setOutput('NO')
                }
            } catch (err) {
                setOutput('NO')
                console.log(err);
            }
        } else {
            alert('Invalid inputs!!!');
        }
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
                <br />
                <input type="button" value="Mint" onClick={handleMint} />
                <br />
                {
                    txHash ?
                        <p>
                            Txn:
                            <a href={`https://moonbase.moonscan.io/tx/${txHash}`} target='_blank' rel="noreferrer">{txHash}</a>
                        </p> :
                        <></>
                }
            </form>
            <hr />
            <h2>Check ownership of an NFT on this chain</h2>
            <form>
                <input type="text" placeholder='Enter your address' onChange={changeAddrInputChk} />
                <br />
                <input type="text" placeholder='Enter NFT contract address' onChange={changeContractAddrInputChk} />
                <br />
                <input type="text" placeholder='Enter NFT token ID' onChange={changeTokenId} />
                <br />
                <input type="button" value="Check" onClick={handleCheckOwnership} />
                <br />
                <div className='output'>{output}</div>
            </form>
        </>

    )
}

export default Receiver