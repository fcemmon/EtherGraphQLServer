var request = require("request");
// import ethers
var ethers = require('ethers');
const express = require("express");
const bodyParser = require("body-parser");
const { graphqlExpress, graphiqlExpress } = require("apollo-server-express");
const { makeExecutableSchema, mergeSchemas } = require("graphql-tools");
const { GraphQLSchema } = require('graphql');
const { address, ABI } = require("./constants/defaultConstant");

const typeDefs = require("./schema/schema");
const { getContract } = require("./contract/getContract");

const { ApolloServer, PubSub } = require("apollo-server");

const pubsub = new PubSub();

let contractInstance = {};

function findTxnForPending() {
  return new Promise(function(resolve, reject) {
    let provider = new ethers.providers.EtherscanProvider();
    provider.on('pending', (transactionHash) => {
        resolve(transactionHash);
    });
  });
}

function addSubscription(transactionHash) {
  return new Promise(function(resolve, reject) {
    let provider = new ethers.providers.EtherscanProvider();

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
              status:"received",
              data:transactionData
          }
      });
      //////////////
    });

    // Get current transaction.
    let transaction = provider.getTransaction(transactionHash)
    .then(transaction => {
        console.log(transaction);
        let amount = parseFloat(transaction.value) / 1e18;
        let transactionData = {
          hash: transaction.hash,
          amount: amount,
          type: "receive",
          time: transaction.timeStamp
        }
        let transactionPublished = {
          status:"pending",
          data:transactionData
        }
        resolve(transactionData);
    })
  });
}

// The resolvers
const resolvers = {
  Query: {
    async contract() {
      let amount = 0;
      let provider = new ethers.providers.EtherscanProvider();
      amount = await provider.getBalance(address);
      return {
        address: contractInstance.address,
        amount: amount
      };
    },

    async transactions() {
      let provider = new ethers.providers.EtherscanProvider();
      let transactionList = provider.getHistory(contractInstance.address)
      .then(history => {
        let return_txs = [];
        history.forEach((tx) => {
          let amount = parseFloat(tx.value) / 1e18;
            let fee = parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice) / 1e18;
            let sender_amount = amount + fee;
            if (tx.to != null && tx.to.toLowerCase() == contractInstance.address.toLowerCase()) {
              return_txs.push({
                hash: tx.hash,
                amount: amount,
                type: 'receive',
                time: tx.timeStamp
              });
            }
        });

        console.log("loaded");

        // publish subscription
        let status = "loaded"
        pubsub.publish('transactionListChannel', {
            getTransactions: {
                status:status,
                data:return_txs
            }
        });
      });

      return {
        status:"loading",
        data:[]
      };
    },
  },

  Mutation:{
       async checkNewEvent(){
           let transactionHash = await findTxnForPending();
           let transaction = await addSubscription(transactionHash);
           return transaction;
       }
  },
  Subscription:{
      transaction:{
          subscribe(){
              return pubsub.asyncIterator('transactionChannel')
          }
      },
      getTransactions:{
        subscribe(){
          return pubsub.asyncIterator('transactionListChannel')
        }
      }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context:{
        pubsub
    }
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
  getContract
  .then(res => (contractInstance = res))
  .catch(err => console.log(err));
});

// // Initialize the app
// const app = express();
// const PORT = 4000;

// // The GraphQL endpoint
// app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));

// // GraphiQL, a visual editor for queries
// app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));

// // Start the server and get contract instance
// app.listen(PORT, () => {
//   console.log("Go to http://localhost:4000/graphiql to run queries!");
//   getContract
//     .then(res => (contractInstance = res))
//     .catch(err => console.log(err));
// });