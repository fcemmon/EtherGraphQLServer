var request = require("request");
var ethers = require('ethers');
const express = require("express");
const bodyParser = require("body-parser");
const { graphqlExpress, graphiqlExpress } = require("apollo-server-express");
const { makeExecutableSchema } = require("graphql-tools");
const eth = require('./eth.js');
const { address, ABI } = require("./constants/defaultConstant");

const typeDefs = require("./schema/schema");
const { getContract } = require("./contract/getContract");

const { GraphQLServer, PubSub } = require('graphql-yoga');

const pubsub = new PubSub();

let contractInstance = {};

function getTransactionList() {
  return new Promise(function(resolve, reject) {
    let return_txs = [];
    let url = "http://api.etherscan.io/api?module=account&action=txlist&address=" + contractInstance.address + "&startblock=0&endblock=99999999&page=1&offset=1000&sort=desc&apikey=VG4EJ7WXR5P5SYPD5466QNRKEFV7T423WA"
    request({
      uri: url,
      method: "GET",
    }, function(error, response, body) {
      console.log("start");
      if (error) {
        reject();
      } else {
        let r_txs = [];
        if (body.length > 0) {
          r_txs = JSON.parse(body);
          if (Array.isArray(r_txs.result) && r_txs.result.length > 0) {
            r_txs.result.forEach((tx) => {
                let amount = parseFloat(tx.value) / 1e18;
                let fee = parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice) / 1e18;
                let sender_amount = amount + fee;
                if (tx.to.toLowerCase() == contractInstance.address.toLowerCase()) {
                  return_txs.push({
                    hash: tx.hash,
                    amount: amount,
                    type: 'receive',
                    time: tx.timeStamp
                  });
                }
            });
          }
        }
        resolve(return_txs);
      }
    });
  });
}

function addSubscription(transactionHash) {
  return new Promise(function(resolve, reject) {
    let provider = new ethers.providers.EtherscanProvider();
    provider.once(transactionHash, (receipt) => {
      let transaction = {
        hash: receipt.hash,
        amount: receipt.value,
        type: "receive",
        time: receipt.timeStamp
      };
      pubsub.publish('transaction', {
          transaction: transaction
      })  
    });

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
      let transactionList = await getTransactionList();
      console.log(transactionList);
      return transactionList;
    },
  },

  Mutation:{
       async checkNewEvent(obj, args, context){
           let transaction = await addSubscription(args.transactionHash);
           return transaction;
       }
  },
  Subscription:{
      transaction:{
          subscribe(){
              return pubsub.asyncIterator('transaction')
          }
      }
  }
};

// Put together a schema
// const schema = makeExecutableSchema({
//   typeDefs,
//   resolvers,

// });
const server  = new GraphQLServer({
    typeDefs,
    resolvers,
    context:{
        pubsub
    }
});

const options = {
    port: 4000   
  }

server.start(options, ({ port }) =>
  {
    console.log("Go to http://localhost:4000/ to run queries!");
    getContract
      .then(res => (contractInstance = res))
      .catch(err => console.log(err));
  }
)

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