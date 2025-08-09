import { ApolloServer, BaseContext } from "@apollo/server";
import { fastifyPlugin, PluginMetadata } from "fastify-plugin";

import { fastifyApolloHandler } from "./handler.js";
import { ApolloFastifyPluginOptions } from "./types.js";
import { isApolloServerLike } from "./utils.js";

const pluginMetadata: PluginMetadata = {
  fastify: "^5.0.0",
  name: "@aldahick/apollo-fastify",
};

export function fastifyApollo<Context extends BaseContext>(
  apollo: ApolloServer<Context>,
) {
  if (apollo === undefined || apollo === null || !isApolloServerLike(apollo)) {
    throw new TypeError("You must pass in an instance of `ApolloServer`.");
  }

  apollo.assertStarted("fastifyApollo()");

  return fastifyPlugin<ApolloFastifyPluginOptions<Context>>(
    (fastify, options) => {
      const {
        path = "/graphql",
        method = ["GET", "POST", "OPTIONS"],
        ...handlerOptions
      } = options;

      fastify.route({
        method,
        url: path,
        handler: fastifyApolloHandler<Context>(apollo, handlerOptions),
      });
    },
    pluginMetadata,
  );
}
