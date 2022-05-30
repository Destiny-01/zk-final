const hre = require("hardhat");

async function main() {
  const DeadTarget = await hre.ethers.getContractFactory("DeadTarget");
  // testnet
  // const deadTarget = await DeadTarget.deploy(
  //   "0xb7e9F327Cc5f90791f9cF98bfeC3cDFb044072bc"
  // );

  // mainnet
  const deadTarget = await DeadTarget.deploy(
    "0x42F3b6dAFAEC1F5df5c7D44224633250fb97b710"
  );

  await deadTarget.deployed();
  console.log("Dead Target deployed to:", deadTarget.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
