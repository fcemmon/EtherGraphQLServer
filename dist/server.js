"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const federation_1 = require("@apollo/federation");
const schema_1 = require("./schema/schema");
const resolver_1 = require("./resolver/resolver");
const getContract_1 = require("./contract/getContract");
const pubsub = new graphql_subscriptions_1.PubSub();
const generateContext = () => __awaiter(void 0, void 0, void 0, function* () {
    const contractInstance = yield getContract_1.getContract();
    return {
        contractInstance,
        pubsub
    };
});
const server = new apollo_server_1.ApolloServer({
    schema: federation_1.buildFederatedSchema([
        {
            typeDefs: schema_1.typeDefs,
            resolvers: resolver_1.resolvers,
        }
    ]),
    context: generateContext,
});
server.listen({ port: 4001 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
//# sourceMappingURL=server.js.map