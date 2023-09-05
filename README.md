# Bot-syncing
Solution to Bot syncing:

# Task
There is a contract at 0x7d3a625977bfd7445466439e60c495bdc2855367 (Goerli) periodically emitting Ping() events. Write a bot (ideally in javascript or typescript) that calls its pong() function for everytime a Ping() emitted. Pass the hash of the transaction where the ping event was emitted to the pong() function.The bot should:
Start at any block and send a pong() for each ping() after this block (save this block number as it’s part of the deliverable).
The program should send exactly one pong() for each ping() made after the starting block. If you’ve made mistakes during the development, please deploy a new bot with a different address.
The bot should be reliable and restart where it stopped in case of bugs, network outage, etc without missing any ping().
You will need goerli eth for this exercise, there is a faucet at https://goerlifaucet.com/
Feel free to deploy the contract again if you wish and run this bot alongside yours. The source code of the contract is verified on etherscan.

Run the bot so we can verify it works (your own machine if it stays up, AWS instance, etc). Note that the bot must stay running until the exercise is corrected.

Deliverables:
Source code of the bot.
Address of the bot.
The block number at which you started running it.

Tip
Think about what types of failures can happen to the bot and defend against it. Examples:
The bot gets rate limited by the provider or there is a temporary network failure and how this can affect an event listener (for example);
A pong the bot submitted never gets mined due to a spike in gas prices. In the case where there are multiple transactions pending mining and the bot gets restarted, can transactions with competing nonces cause a malfunction?

# Solution
While the initial plan was to send a ping event to the contract deployed on the Goerli testnet, I encountered issues obtaining test ether due to Goerli faucets being unavailable. To work around this, I chose to deploy a replica of the contract on the Sepolia testnet. As a result, the system is currently set up to listen for ping events from the original contract on Goerli and responds with pong events to the replicated contract on Sepolia.

# Deliverables
Address of the bot = 0xEd94590f919D2ac96D5c3C955b737EB433939Eb6

Address of the sepolia contract = 0xa5fBd3C1Fbf755a75f1e6DBE1f1Cbd58630051e4

Contract eatherscan link = https://sepolia.etherscan.io/address/0xa5fbd3c1fbf755a75f1e6dbe1f1cbd58630051e4

Starting block number = 8824729
