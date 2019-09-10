import { ApolloServer } from 'apollo-server';
import { PubSub } from 'graphql-subscriptions';
import { buildFederatedSchema } from '@apollo/federation'
import { typeDefs } from './schema/schema'
import { resolvers } from './resolver/resolver'
import { getContract } from './contract/getContract';
const pubsub = new PubSub();

const generateContext = async () => {
    const contractInstance = await getContract();
    return {
        contractInstance,
        pubsub
    }
}
const server = new ApolloServer({
    schema: buildFederatedSchema([
        {
            typeDefs: typeDefs,
            resolvers: resolvers as any,
        }
    ]),
    context: generateContext,
});

server.listen({ port: 4001 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
