const { getNamedAccounts, deployments, network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    // log("Deploying FundMe and waiting for confirmations...")
    console.log(ethUsdPriceFeedAddress)
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], //0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("----------------------------------------------------")
    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress]) //0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
    }
}

module.exports.tags = ["all", "fundme"]
