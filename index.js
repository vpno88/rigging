const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");

const { handleApiEndpoint } = require("./spec");
const { getClusters } = require("./config");
const { createClusterProxy } = require("./proxy");

const { getBuiltMesh } = require("./.mesh");

const main = async () => {
  const { schema, contextBuilder } = await getBuiltMesh();
  const app = express();

  getClusters().forEach(([cluster, config]) => {
    const path = `/clusters/${cluster}`;
    app.use(path, createClusterProxy(path, config));
  });

  const apolloServer = new ApolloServer({
    schema,
    context: contextBuilder,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen({ port: 8000 }, () => console.log(`Server ready`));
};

main();
