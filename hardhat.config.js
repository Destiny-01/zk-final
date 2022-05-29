require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    testnet: {
      url: `https://api.s0.b.hmny.io`,
      accounts: [`0x${process.env.PRIV_KEY}`],
    },
    mainnet: {
      url: `https://api.harmony.one`,
      accounts: [`0x${process.env.PRIV_KEY}`],
    },
  },
};
