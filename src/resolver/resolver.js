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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var ethers_1 = require("ethers");
var defaultConstant_1 = require("../constants/defaultConstant");
function findTxnForPending(contractInstance) {
    return new Promise(function (resolve, reject) {
        contractInstance.on("Transfer", function (from, to, value, event) {
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
        var provider = ethers_1.ethers.getDefaultProvider('ropsten');
        // Waiting for completing transaction
        provider.once(transactionHash, function (receipt) {
            var transaction = {
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
            .then(function (transaction) {
            console.log(transaction);
            var amount = parseFloat(transaction.value.toString()) / 1e18;
            var transactionData = {
                hash: transaction.hash,
                amount: amount,
                type: "receive",
                time: transaction.timestamp
            };
            var transactionPublished = {
                status: "pending",
                data: transactionData
            };
            resolve(transactionPublished);
        });
    });
}
exports.resolvers = {
    Query: {
        contract: function (parent, _, context) {
            return __awaiter(this, void 0, void 0, function () {
                var provider, amount, etherString, balance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            provider = new ethers_1.ethers.providers.EtherscanProvider();
                            return [4 /*yield*/, provider.getBalance(defaultConstant_1.address)];
                        case 1:
                            amount = _a.sent();
                            etherString = ethers_1.ethers.utils.formatEther(amount);
                            balance = parseFloat(etherString);
                            return [2 /*return*/, {
                                    address: context.contractInstance.address,
                                    amount: balance
                                }];
                    }
                });
            });
        },
        transactions: function (parent, _, context) {
            return __awaiter(this, void 0, void 0, function () {
                var provider;
                return __generator(this, function (_a) {
                    provider = new ethers_1.ethers.providers.EtherscanProvider();
                    provider.getHistory(context.contractInstance.address)
                        .then(function (history) {
                        var return_txs = [];
                        history.forEach(function (tx) {
                            var amount = parseFloat(tx.value.toString()) / 1e18;
                            var etherString = ethers_1.ethers.utils.formatEther(amount);
                            var balance = parseFloat(etherString);
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
                        var status = "loaded";
                        context.pubsub.publish('transactionListChannel', {
                            getTransactions: {
                                status: status,
                                data: return_txs
                            }
                        });
                    });
                    return [2 /*return*/, {
                            status: "loading",
                            data: []
                        }];
                });
            });
        }
    },
    Mutation: {
        checkNewEvent: function (parent, _, context) {
            return __awaiter(this, void 0, void 0, function () {
                var transactionHash, transaction;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, findTxnForPending(context.contractInstance)];
                        case 1:
                            transactionHash = _a.sent();
                            return [4 /*yield*/, addSubscription(context.pubsub, transactionHash)];
                        case 2:
                            transaction = _a.sent();
                            return [2 /*return*/, transaction];
                    }
                });
            });
        }
    },
    Subscription: {
        transaction: {
            subscribe: function (parent, _, context) {
                console.log(typeof context.pubsub);
                return context.pubsub.asyncIterator('transactionChannel');
            }
        },
        getTransactions: {
            subscribe: function (parent, _, context) {
                return context.pubsub.asyncIterator('transactionListChannel');
            }
        }
    }
};
