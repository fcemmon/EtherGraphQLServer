"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
exports.typeDefs = apollo_server_1.gql `
    type Contract {
        address: String!
        amount: Float    
    }

    type Transaction {
        hash: String
        amount: Float
        type: String
        time: String
    }

    type Query {
        contract: Contract
        transactions: TransactionLoaded!
    }

    type Mutation {
        checkNewEvent: TransactionPublished
    }

    type TransactionPublished {
        status:String
        data: Transaction
    }

    type TransactionLoaded {
        status: String
        data: [Transaction!]
    }

    type Subscription {
        transaction: TransactionPublished
        getTransactions: TransactionLoaded
    }
`;
//# sourceMappingURL=schema.js.map