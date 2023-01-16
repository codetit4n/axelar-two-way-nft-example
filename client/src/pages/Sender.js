import React, { useState, useEffect } from 'react'
import './styles.css'
import { BigNumber, ethers } from 'ethers';
import { AxelarQueryAPI, EvmChain, GasToken } from '@axelar-network/axelarjs-sdk'
import deployment_info from '../blockchain-data/latest_addresses.json'
import SenderJSON from '../blockchain-data/contracts/Sender.sol/Sender.json'

const sdk = new AxelarQueryAPI({
    environment: "testnet",
});

function Sender() {
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
                params: [{ chainId: '0xa869' }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0xa869',
                                chainName: 'Avalanche FUJI Testnet RPC',
                                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                                nativeCurrency: {
                                    name: 'AVAX',
                                    symbol: 'AVAX',
                                    decimals: 18
                                },
                                blockExplorerUrls: ['https://testnet.snowtrace.io/']
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

    const [contractAddr, setContractAddr] = useState(null)
    const [tokenId, setTokenId] = useState(null)
    const [txHash, setTxHash] = useState(null)

    const changeNftContractAddr = (e) => {
        setContractAddr(e.target.value)
    }

    const changeTokenId = (e) => {
        setTokenId(e.target.value)
    }

    const handleSubmitTxn = async (e) => {
        e.preventDefault();
        setLoader(true);
        try {
            // Estimate gas needed using SDK
            const estimateGasUsed = 700000;
            const gasAmountSource = await sdk.estimateGasFee(
                EvmChain.AVALANCHE,
                EvmChain.MOONBEAM,
                GasToken.AVAX,
                estimateGasUsed
            );
            const gasAmountRemote = await sdk.estimateGasFee(
                EvmChain.MOONBEAM,
                EvmChain.AVALANCHE,
                GasToken.AVAX,
                estimateGasUsed
            );

            // Create payload
            const payload = ethers.utils.defaultAbiCoder.encode(['string'], ['Hello Lokesh here!'])
            // Transaction
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            const contract = new ethers.Contract(deployment_info.Sender.address, SenderJSON.abi, signer);
            const src = BigNumber.from(gasAmountSource)
            const rem = BigNumber.from(gasAmountRemote)
            const sum = src.add(rem);
            const txn = await contract.sendContractCall('Moonbeam', deployment_info.Receiver.address, payload, gasAmountRemote, {
                value: sum
            })
            setTxHash(txn.hash);
        } catch (err) {
            console.log(err);
        }
        setLoader(false);
    }
    // make sure you are on the right chain
    if (chainId != '43113' && currentAddress != null) {
        switchChain()
        return <h1>Please switch network to Avalanche FUJI testnet</h1>
    }
    if (loader) {
        return <h1>Loading...</h1>
    }
    return (
        <>
            <h1>Avalanche FUJI Chain</h1>
            <hr />
            <h2>Test Two Way GMP on Axelar</h2>
            <form>
                <input type="text" value={`Address: ${currentAddress}`} disabled />
                <br />
                <input type="text" placeholder='Enter NFT contract address (on Moonbase Alpha Chain)' onChange={changeNftContractAddr} />
                <br />
                <input type="text" placeholder='Enter NFT token ID (on Moonbase Alpha Chain)' onChange={changeTokenId} />
                <br />
                <input type="button" value="Transact" onClick={handleSubmitTxn} />
                <br />
                {
                    txHash ?
                        <p>
                            Txn:
                            <a href={`https://testnet.axelarscan.io/gmp/${txHash}`} target='_blank' rel="noreferrer">{txHash}</a>
                        </p> :
                        <></>
                }
            </form>
        </>
    )
}

export default Sender