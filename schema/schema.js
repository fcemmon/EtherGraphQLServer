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
        checkNewEvent: TransactionPublished
    }

    type Subscription {
        transaction: TransactionPublished!
        getTransactions: TransactionLoaded
    }

    type TransactionPublished {
        status:String
        data: Transaction
    }

    type TransactionLoaded {
        status: String
        data: [Transaction!]
    }
`;

module.exports = typeDefs;
