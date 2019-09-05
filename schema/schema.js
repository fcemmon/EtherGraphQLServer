const typeDefs = `
    type Contract {
        address: String!,
        amount: Int    
    }

    type Transaction {
        hash: String,
        amount: Int,
        type: String,
        time: String
    }

    type Event {
        author:String,
        newValue: String,
        oldValue: String,
        blockNumber: String
    }

    type Query {
        contract: Contract,
        transactions: [Transaction!]!
    }
    
    type Subscription {
        event: EventSubscriptionPayload!
    }

    type EventSubscriptionPayload {
        data: Event!
    }

`;

module.exports = typeDefs;
