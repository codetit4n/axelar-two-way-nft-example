import React from 'react'
import deployment_info from './blockchain-data/latest_addresses.json';

function Footer() {
    const senderLink = `https://testnet.snowtrace.io/address/${deployment_info.Sender.address}`
    const receiverLink = `https://moonbase.moonscan.io/address/${deployment_info.Receiver.address}`
    const nftLink = `https://moonbase.moonscan.io/address/${deployment_info.TestNft.address}`
    return (
        <>
            <hr />
            <h3>Avalanche Chain:</h3>
            Sender Contract:<a href={senderLink} target='_blank' rel="noreferrer">{deployment_info.Sender.address}</a>
            <h3>Moonbase Alpha Chain:</h3>
            Receiver Contract:<a href={receiverLink} target='_blank' rel="noreferrer">{deployment_info.Receiver.address}</a>
            <br />
            Test NFT Contract:<a href={nftLink} target='_blank' rel="noreferrer">{deployment_info.TestNft.address}</a>
            <hr />
        </>
    )
}

export default Footer