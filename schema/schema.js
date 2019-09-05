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
        transactions: [Transaction!]!
    }

    type Mutation {
        checkNewEvent(transactionHash:String): String!
    }

    type Subscription {
        event: EventSubscriptionPayload!
    }

    type EventSubscriptionPayload {
        data: String!
    }
`;

module.exports = typeDefs;
