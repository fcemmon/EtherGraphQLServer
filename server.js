const express = require("express");
const bodyParser = require("body-parser");
const { graphqlExpress, graphiqlExpress } = require("apollo-server-express");
const { makeExecutableSchema } = require("graphql-tools");

const typeDefs = require("./schema/schema");
const contractService = require("./contracts/getContract.js");
var EthResolver = require("./resolver/EthResolver");

let contract = {};
// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  EthResolver
});

// Initialize the app
const app = express();
const PORT = 4000;

// The GraphQL endpoint
app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));

// GraphiQL, a visual editor for queries
app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));

app.listen(PORT, () => {
	console.log("Go to http://localhost:4000/graphiql to run queries!");
	contractService.getContract()
    .then(res=>{
    	contractInstance = res;
   })
    .catch(err => console.log(err));
});