const typeDefs = `
    type Contract {
        address: String!
        amount: Int    
    }

    type Transaction {
        hash: String
        amount: Int
        type: String
        time: String
    }

    type Query {
        contract: Contract
        transactions: TransactionLoaded!
    }

    type Mutation {
        checkNewEvent(transactionHash:String): Transaction
    }

    type Subscription {
        transaction: Transaction!
        getTransactions: TransactionLoaded
    }

    type TransactionLoaded {
        status: String
        data: [Transaction!]
    }
`;

module.exports = typeDefs;
