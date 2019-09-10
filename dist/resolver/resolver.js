"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const defaultConstant_1 = require("../constants/defaultConstant");
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
        let provider = ethers_1.ethers.getDefaultProvider('ropsten');
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
            const amount = parseFloat(transaction.value.toString()) / 1e18;
            let transactionData = {
                hash: transaction.hash,
                amount: amount,
                type: "receive",
                time: transaction.timestamp
            };
            let transactionPublished = {
                status: "pending",
                data: transactionData
            };
            resolve(transactionPublished);
        });
    });
}
exports.resolvers = {
    Query: {
        contract(parent, _, context) {
            return __awaiter(this, void 0, void 0, function* () {
                let provider = new ethers_1.ethers.providers.EtherscanProvider();
                const amount = yield provider.getBalance(defaultConstant_1.address);
                let etherString = ethers_1.ethers.utils.formatEther(amount);
                const balance = parseFloat(etherString);
                return {
                    address: context.contractInstance.address,
                    amount: balance
                };
            });
        },
        transactions(parent, _, context) {
            return __awaiter(this, void 0, void 0, function* () {
                let provider = new ethers_1.ethers.providers.EtherscanProvider();
                provider.getHistory(context.contractInstance.address)
                    .then(history => {
                    let return_txs = [];
                    history.forEach((tx) => {
                        const amount = parseFloat(tx.value.toString()) / 1e18;
                        let etherString = ethers_1.ethers.utils.formatEther(amount);
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
                    let status = "loaded";
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
            });
        },
    },
    Mutation: {
        checkNewEvent(parent, _, context) {
            return __awaiter(this, void 0, void 0, function* () {
                let transactionHash = yield findTxnForPending(context.contractInstance);
                let transaction = yield addSubscription(context.pubsub, transactionHash);
                return transaction;
            });
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
                return context.pubsub.asyncIterator('transactionListChannel');
            }
        }
    }
};
//# sourceMappingURL=resolver.js.map