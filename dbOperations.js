import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://username:password@localhost:27017/';
const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
let db;
let pingCollection;
const startingBlock = 8824729;

async function connectToDB() {
    await client.connect();
    console.log('connected to mongodb')
    db = client.db();
    pingCollection = db.collection("pings"); 
}

async function insertManyPingData(pingArray) {
    console.log(`inserting ${pingArray.length} elements`);
    return pingCollection.insertMany(pingArray);
}

async function resolvePingData(transactionHash){
    console.log(`resolving tnx ${transactionHash}`);
    return pingCollection.updateOne({ transactionHash }, { $set: { type: 'resolved' } });
}

async function getLatestBlockNumber() {
    const latestEvent = await pingCollection.find().sort({ blockNumber: -1 }).limit(1).toArray();
    return latestEvent.length > 0 ? latestEvent[0].blockNumber + 1 : startingBlock;
}

async function getEarliestEvent() {
    const earliestEvent = await pingCollection.find({type:{$eq:'new'}}).sort({ blockNumber: 1 }).limit(1).toArray();
    return earliestEvent[0];
}

export { 
    connectToDB, 
    resolvePingData, 
    getLatestBlockNumber, 
    getEarliestEvent,
    insertManyPingData
};
