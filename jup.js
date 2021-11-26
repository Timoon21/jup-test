const web3 = require('@solana/web3.js');
const jupiter = require('@jup-ag/core');

const connection = new web3.Connection('https://solana-api.projectserum.com');
const secretKey = require('../.config/solana/id.json');
const keypair = web3.Keypair.fromSecretKey(Uint8Array.from(secretKey));

const tokenA = new web3.PublicKey('So11111111111111111111111111111111111111112') // WSOL
const tokenB = new web3.PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // USDC
const programId = new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')


async function toSwap(jup, routes){
  console.log(routes[0].inAmount,' ',routes[0].outAmount,' ',routes[0].outAmountWithSlippage)
  const { execute } = await jup.exchange({
    route: routes[0]
  })
  const swapResult = await execute();
  return swapResult
}

async function getRoutes(jup, tokenA, tokenB, amount, slip){
  routes = await jup.computeRoutes(tokenA, tokenB, amount, slip);
  return routes
};

async function jupSwap(tokenA, tokenB, amount){
  const jup = await jupiter.Jupiter.load({
    connection,
    cluster: 'mainnet-beta',
    user: keypair
  });

  let routeAB = false
  let gain = false

  while (routeAB == false) {
    try {
      routeAB = await getRoutes(jup, tokenA, tokenB, amount, 1)
    } catch (e) {};
  }
  console.log('route ok')
  if (routeAB) {
    swapResult = await toSwap(jup, routeAB)
    return swapResult
  }
}

async function main(){
  amount = 121000000
  swapResult = await jupSwap(tokenA, tokenB, amount)
  if (swapResult.error) {
    console.log(new Date(), ': SwapError', swapResult.error)
    return false
  } else {
    console.log(new Date(), ': SwapTx',swapResult.txid, " In: ",swapResult.inputAmount, " Out: ",swapResult.outputAmount)
    swapResult = await jupSwap(tokenB, tokenA, swapResult.outputAmount)
    if (swapResult.error) {
      console.log(new Date(), ': SwapError', swapResult.error)
    } else {
      console.log(new Date(), ': SwapTx',swapResult.txid, " In: ",swapResult.inputAmount, " Out: ",swapResult.outputAmount)
    }
    return false
  }
}

console.log(new Date(),': init');
main();
