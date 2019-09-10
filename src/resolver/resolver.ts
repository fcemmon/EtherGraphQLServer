import { ethers } from 'ethers'
import { address } from '../constants/defaultConstant';

function findTxnForPending(contractInstance) {
    return new Promise(function (resolve, reject) {
        contractInstance.on("Transfer", (from, to, value, event) => {
            console.log(from, to, value);
            console.log(event.blockNumber);
            if (to == contractInstance.address) {
                resolve(event.transactionHash);
            }
        });

    });
}

function addSubscription(pubsub, transactionHash) {
    return new Promise(function (resolve, reject) {
        let provider = ethers.getDefaultProvider('ropsten');

        // Waiting for completing transaction
        provider.once(transactionHash, (receipt) => {
            let transaction = {
                hash: receipt.hash,
                amount: receipt.value,
                type: "receive",
                time: receipt.timeStamp
            };

            // publish subscription
            pubsub.publish('transactionChannel', {
                transaction: {
                    status: "received",
                    data: transaction
                }
            });
            //////////////
        });

        // Get current transaction.
        provider.getTransaction(transactionHash)
            .then((transaction) => {
                console.log(transaction);
                const amount: number = parseFloat(transaction.value.toString()) / 1e18;
                let transactionData = {
                    hash: transaction.hash,
                    amount: amount,
                    type: "receive",
                    time: transaction.timestamp
                }
                let transactionPublished = {
                    status: "pending",
                    data: transactionData
                }
                resolve(transactionPublished);
            })
    });
}

export const resolvers = {
    Query: {
        async contract(parent, _, context) {
            let provider = new ethers.providers.EtherscanProvider();
            const amount = await provider.getBalance(address);
            let etherString = ethers.utils.formatEther(amount);
            const balance = parseFloat(etherString);
            return {
                address: context.contractInstance.address,
                amount: balance
            };
        },

        async transactions(parent, _, context) {
            let provider = new ethers.providers.EtherscanProvider();
            provider.getHistory(context.contractInstance.address)
                .then(history => {
                    let return_txs = [];
                    history.forEach((tx) => {
                        const amount: number = parseFloat(tx.value.toString()) / 1e18;
                        let etherString = ethers.utils.formatEther(amount);
                        const balance = parseFloat(etherString);
                        if (tx.to != null && tx.to.toLowerCase() == context.contractInstance.address.toLowerCase()) {
                            return_txs.push({
                                hash: tx.hash,
                                amount: balance,
                                type: 'receive',
                                time: tx.timestamp
                            });
                        }
                    });

                    console.log("loaded");

                    // publish subscription
                    let status = "loaded"
                    context.pubsub.publish('transactionListChannel', {
                        getTransactions: {
                            status: status,
                            data: return_txs
                        }
                    });
                });

            return {
                status: "loading",
                data: []
            };
        },
    },

    Mutation: {
        async checkNewEvent(parent, _, context) {
            let transactionHash = await findTxnForPending(context.contractInstance);
            let transaction = await addSubscription(context.pubsub, transactionHash);
            return transaction;
        }
    },
    Subscription: {
        transaction: {
            subscribe(parent, _, context) {
                console.log(typeof context.pubsub);
                return context.pubsub.asyncIterator('transactionChannel');
            }
        },
        getTransactions: {
            subscribe(parent, _, context) {
                return context.pubsub.asyncIterator('transactionListChannel')
            }
        }
    }
}
