import Web3 from 'web3';
import { 
    connectToDB,  
    resolvePingData, 
    getLatestBlockNumber, 
    getNonce, 
    getEarliestEvent,
    insertManyPingData
} from './dbOperations.js'; 
import 'dotenv/config'

// ABI for the PingPong contract
const contractABI = [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[],"name":"Ping","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"txHash","type":"bytes32"}],"name":"Pong","type":"event"},
    {"inputs":[],"name":"ping","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"pinger","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"bytes32","name":"_txHash","type":"bytes32"}],"name":"pong","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

const web3Goerli = new Web3(new Web3.providers.WebsocketProvider(process.env.GOERLI_ALCHEMY_ENDPOINT));
const web3Sepolia = new Web3(new Web3.providers.HttpProvider(process.env.SEPOLIA_ALCHEMY_ENDPOINT));

const goerliContract = new web3Goerli.eth.Contract(contractABI, process.env.GOERLI_CONTRACT_ADDRESS);
const sepoliaContract = new web3Sepolia.eth.Contract(contractABI, process.env.SEPOLIA_CONTRACT_ADDRESS);

(async function() {
    const pings = [];
    await connectToDB();
    const fromBlock = await getLatestBlockNumber();
    console.log(`listening from block : ${fromBlock}`)

    const subscription = goerliContract.events.Ping({
        fromBlock
    });

    subscription.on("connected", ()=>{
        console.log('connected to eth events');
    });

    subscription.on('data', (event)=>{
        pings.push({transactionHash: event.transactionHash, blockNumber: event.blockNumber, type:'new'})
    });

    setTimeout(handlePingEvent, 100);
    setTimeout(handlePongEvent, 1000);

    async function handlePongEvent(){
        try{
            const earliestEvent = await getEarliestEvent();
            if(earliestEvent){
                const nonce = await getNonce();
                await sendPongEvent(earliestEvent.transactionHash, nonce);
                await resolvePingData(earliestEvent.transactionHash);
            }
        } catch(e){
            console.log(`handling pong error: ${e}`)
        }
        setTimeout(handlePongEvent, 1000)
    }
    
    async function handlePingEvent(){
        if(pings.length){    
            try{
                const pingsToInsert = pings.splice(0, 100);
                await insertManyPingData(pingsToInsert);
            } catch(e){
                console.log(e);
            }    
        }
        setTimeout(handlePingEvent, 100)
    }
    
})();

async function sendPongEvent(tnxHash, nonce){
    console.log(`sending pong with tnx: ${tnxHash}, nonce: ${nonce}`)
    const baseGasPrice = await web3Sepolia.eth.getGasPrice();
    const gasLimit = await sepoliaContract.methods.pong(tnxHash).estimateGas({ from: process.env.WALLET_ADDRESS });
    const gasLimitWithBuffer = gasLimit * 2n;
    const adjustedGasPrice = baseGasPrice * 2n

    const tx = {
        data: sepoliaContract.methods.pong(tnxHash).encodeABI(),
        from: process.env.WALLET_ADDRESS,
        value:0,
        gas: gasLimitWithBuffer,
        gasPrice: adjustedGasPrice,
        to: process.env.SEPOLIA_CONTRACT_ADDRESS,
        nonce
    };

    const signedTx = await web3Sepolia.eth.accounts.signTransaction(tx, process.env.WALLET_PRIVATE_KEY);
    // Send the transaction
    try{
        const sent = await web3Sepolia.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(`sent: ${sent}`)
        return sent;
    }catch(e){
        console.log(`something went wrong during pong: ${e}`)
        throw e;
    }
}
