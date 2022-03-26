//region:imports
const Path = require('path');
global.appRoot = Path.resolve('./');
const Dotenv = require('dotenv').config();
const Big = require('big.js');
const Chalk = require('chalk');
const Common = require('ethereumjs-common').default;
const Commonn = require('@ethereumjs/common').default;
const Ethers = require('ethers');
const Sign = require('eth-sign-utils');
const Timer = require('./timer.js');
const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
//endregion:imports

//region:connection
let ethers;
let web3;

const WEB_SOCKET_NODE = process.env.WEB_SOCKET_NODE; // REPLACE WITH YOUR PRIVATE NODE

const WEB_SOCKET_OPTIONS = {
    timeout: 30000, // ms

    clientConfig: {
        // Useful if requests are large
        maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
        maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

        // Useful to keep a connection alive
        keepalive: true,
        keepaliveInterval: -1 // ms
    },

    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 1000, // ms
        maxAttempts: 10,
        onTimeout: false
    }
};
const WEB_SOCKET_BSC_FORK = Common.forCustomChain(
    'mainnet',
    {
        name: 'Binance Smart Chain Mainnet',
        networkId: 56,
        chainId: 56,
        url: WEB_SOCKET_NODE
    },
    'istanbul',
);
//endregion:connection

//region:constants
const PANCAKESWAP_ROUTER_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const PANCAKESWAP_FACTORY_ADDRESS = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";

const BNB_TOKEN_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const BUSD_TOKEN_ADDRESS = "0xe9e7cea3dedca5984780bafc599bd69add087d56";

const pancakeswapRouterAbi = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
const pancakeswapFactoryAbi = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[],"name":"INIT_CODE_PAIR_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
const tokenAbi = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint256","name":"_decimals","type":"uint256"},{"internalType":"uint256","name":"_supply","type":"uint256"},{"internalType":"uint256","name":"_txFee","type":"uint256"},{"internalType":"uint256","name":"_burnFee","type":"uint256"},{"internalType":"uint256","name":"_charityFee","type":"uint256"},{"internalType":"address","name":"_FeeAddress","type":"address"},{"internalType":"address","name":"tokenOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"FeeAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_BURN_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_CHARITY_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_TAX_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tAmount","type":"uint256"}],"name":"deliver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"excludeAccount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"includeAccount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isCharity","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isExcluded","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tAmount","type":"uint256"},{"internalType":"bool","name":"deductTransferFee","type":"bool"}],"name":"reflectionFromToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"setAsCharityAccount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rAmount","type":"uint256"}],"name":"tokenFromReflection","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBurn","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalCharity","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_txFee","type":"uint256"},{"internalType":"uint256","name":"_burnFee","type":"uint256"},{"internalType":"uint256","name":"_charityFee","type":"uint256"}],"name":"updateFee","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const extraAbi = [{"inputs":[],"name":"_maxTxAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
//endregion:constants

//region:properties
const address = process.env.ACCOUNT_ADDRESS;
const privateKey = process.env.ACCOUNT_PRIVATE_KEY;

const tokenAddress = process.env.SNIPE_TOKEN;
let tokenSymbol;
let tokenDecimals;

const snipeBnbAmount = process.env.SNIPE_BNB_AMOUNT;

const buyGasPrice = process.env.BUY_GAS_PRICE_GWEI * 1e9;
const buyGasLimit = process.env.BUY_GAS_LIMIT;
const buyTimeout = process.env.BUY_TIMEOUT_SEC;
//endregion:properties

let bnbBalanceBeforeBuyAndSell;

let initLiquidityDetected = false;

// Bot entry point
(
    async function snipe() {
        validateInput();
        startupInfo();
        await _snipe();
    }
)();

function validateInput() {
    console.log(Chalk.yellow('Validating input from .env config file...'));
    // Currently, I've removed support for Uniswap due to various bugs;
    // I'll try to add Uniswap back in the upcoming updates...
    // if (data.swap === undefined || data.swap === '') {
    //     console.log(Chalk.red("Please define SWAP variable in .env (pancake or uni)"));
    //     process.exit(-1);
    // }
    if (tokenAddress === undefined || tokenAddress === '') {
        console.log(Chalk.red("Please define SNIPE_TOKEN variable in .env"));
        process.exit(-1);
    }
    if (snipeBnbAmount === undefined || snipeBnbAmount === '') {
        console.log(Chalk.red("Please define SNIPE_BNB_AMOUNT variable in .env"));
        process.exit(-1);
    }
    if (address === undefined || address === '') {
        console.log(Chalk.red("Please define ACCOUNT_ADDRESS variable in .env"));
        process.exit(-1);
    }
    if (privateKey === undefined || privateKey === '') {
        console.log(Chalk.red("Please define ACCOUNT_PRIVATE_KEY variable in .env"));
        process.exit(-1);
    }
    console.log(Chalk.green('All input was successfully validated!'));
}

function startupInfo() {
    console.log(Chalk.green('=================================================='));
    console.log(Chalk.green('PancakeSwap mempool sniping bot v1.0.2'));
    console.log(Chalk.green('=================================================='));
    console.log(Chalk.green(`Swap exchange - PancakeSwap`));
    console.log(Chalk.green(`Wallet address: ${address}`));
    console.log(Chalk.green(`Target token (to snipe) - ${tokenAddress}`));
    console.log(Chalk.green(`Target amount (to buy) - ${snipeBnbAmount}`));
    console.log(Chalk.green('Proceeding to snipe...'));
    console.log(Chalk.green('=================================================='));
}

// Magic stuff
async function _snipe() {
    // Init connection
    const provider = new Web3.providers.WebsocketProvider(WEB_SOCKET_NODE, WEB_SOCKET_OPTIONS);
    web3 = new Web3(provider);
    ethers = new Ethers.providers.WebSocketProvider(WEB_SOCKET_NODE);

    // Init properties
    tokenSymbol = await getTokenSymbol(tokenAddress);
    tokenDecimals = await getTokenDecimals(tokenAddress);

    // Get BNB balance before buy operation
    bnbBalanceBeforeBuyAndSell = await getAccountBnbBalance();

    // Prepare buy transaction
    let rawTx = await prepareBuyTransaction();
    let signedTx = await signTransaction(rawTx);

    // Start listening for liquidity...
    await listenForAddLiquidity(buyToken, signedTx);
}

//region:token_specific_functions
async function getTokenSymbol() {
    let tokenInstance = new web3.eth.Contract(tokenAbi, tokenAddress);
    return await tokenInstance.methods.symbol().call();
}

async function getTokenDecimals() {
    let tokenInstance = new web3.eth.Contract(tokenAbi, tokenAddress);
    return await tokenInstance.methods.decimals().call();
}

async function getAccountBnbBalance() {
    return await web3.eth.getBalance(address);
}
//endregion:token_specific_functions

//region:account_specific_functions
async function getAccountNonce() {
    return await web3.eth.getTransactionCount(address);
}
//endregion:account_specific_functions

//region:approve_buy_sell
async function buyToken(signedTx) {
    let sentSignedBuyTxn;

    // Trying to buy token until it is succeeded
    while (true) {
        try {
            sentSignedBuyTxn = await sendSignedTransaction(signedTx);
            break;
        } catch (error) {
            console.warn('Can\'t buy token yet:');
            console.warn(error);
            await Timer.sleep(1000);
        }
    }

    let txMined = await getTransactionReceipt(sentSignedBuyTxn.hash);
    if (txMined) {
        console.info('Token bought successfully!');
        disconnect();
    } else {
        console.warn('Buy transaction is not mined...');
        console.warn('Aborting operation...');
        process.exit(-1);
    }
}
//endregion:approve_buy_sell

//region:transaction_specific_functions
async function prepareBuyTransaction() {
    let bnbAmountInWei = web3.utils.toWei(snipeBnbAmount, 'ether');

    let amountOutMin = '1';

    let router = new web3.eth.Contract(pancakeswapRouterAbi,
        PANCAKESWAP_ROUTER_ADDRESS,
        {from: address});

    let txData = router.methods.swapExactETHForTokens(
        web3.utils.toHex(amountOutMin),
        [BNB_TOKEN_ADDRESS, tokenAddress],
        address,
        web3.utils.toHex(Math.round(Date.now() / 1000) + buyTimeout)
    );

    let buyNonce = await getAccountNonce();

    let rawTransaction = {
        'from': address,
        'gasPrice': web3.utils.toHex(buyGasPrice),
        'gasLimit': web3.utils.toHex(buyGasLimit),
        'to': PANCAKESWAP_ROUTER_ADDRESS,
        'value': web3.utils.toHex(bnbAmountInWei),
        'data': txData.encodeABI(),
        'nonce': web3.utils.toHex(buyNonce)
    };

    console.debug(`Buy transaction prepared successfully`);
    return rawTransaction;
}

async function signTransaction(rawTransaction) {
    let transaction = new Tx(rawTransaction, {'common': WEB_SOCKET_BSC_FORK});
    transaction.sign(Buffer.from(privateKey, 'hex'));
    console.debug(`Transaction signed successfully`);
    return transaction;
}

async function sendSignedTransaction(transaction) {
    let result = await ethers.sendTransaction('0x' + transaction.serialize().toString('hex'));
    console.debug(`Transaction https://bscscan.com/tx/${result.hash} sent`);
    return result;
}

async function getTransactionReceipt(transactionHash) {
    let receipt = await ethers.waitForTransaction(transactionHash);
    if (receipt && receipt.blockNumber && receipt.status === 1) { // 0 - failed, 1 - success
        console.info(`Transaction https://bscscan.com/tx/${transactionHash} mined, status success`);
        return true;
    } else if (receipt && receipt.blockNumber && receipt.status === 0) {
        console.warn(`Transaction https://bscscan.com/tx/${transactionHash} mined, status failed`);
        return false;
    } else {
        console.warn(`Transaction https://bscscan.com/tx/${transactionHash} not mined`);
        return false;
    }
}
//endregion:transaction_specific_functions

async function listenForAddLiquidity(callback, args) {
    const token = tokenAddress.slice(2).toLowerCase(); // Without 0x

    const subscription = web3.eth.subscribe('pendingTransactions', (error, res) => {
        if (error) console.error(error);
    });

    subscription.on('data', (txHash) => {
        setTimeout(async () => {
            if (initLiquidityDetected) {
                return;
            }

            try {
                let tx = await web3.eth.getTransaction(txHash);

                if (tx && tx.to && tx.to.toLowerCase() === PANCAKESWAP_ROUTER_ADDRESS) { // 1. pancakeswap router
                    if (tx.input && tx.input.startsWith('0xf305d719')) {                 // 2. 'addLiquidityETH' function
                        if (tx.input.toLowerCase().includes(token)) {                    // 3. snipe token address

                            console.info('Detected addLiquidityETH transaction for token')
                            initLiquidityDetected = true;
                            callback(args);

                        }
                    }
                }
            } catch (error) {
                console.error('Unexpected exception while listening for pending transactions - ' + error);
            }
        })
    });
}

function disconnect() {
    // ethers.destroy()
    // web3.disconnect();
    // FIXME: for some reason, disconnect function does not seem to correctly closing WS connection;
    //   For now, the bot needs to be terminated via process.exit(code)
    console.warn('Shutting down bot...')
    process.exit(1);
}
