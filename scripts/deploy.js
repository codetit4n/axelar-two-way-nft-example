const hre = require("hardhat");

async function main() {
  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  await lock.deployed();
  console.log('Deployed to:', lock.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
