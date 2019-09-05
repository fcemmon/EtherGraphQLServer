const typeDefs = `
    type Contract {
        address: String!,
        amount: Int,
        totalSupply: Int
    }

    type Transaction {
    	hash: String!,
    	type: String!,
    	time: String!,
        amount: Int
    }

    type Query {
        contract: Contract!
        transctions: [Transaction!]
    }

    type Mutation {
        donate(amount: Int!): Contract!
    }
`;

module.exports = typeDefs;
