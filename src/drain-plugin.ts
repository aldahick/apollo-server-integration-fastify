import type { ApolloServerPlugin, BaseContext } from "@apollo/server";
import type { FastifyInstance } from "fastify";

/**
 * Add this plugin to your ApolloServer to drain the server during shutdown.
 * Fastify will use the new server.closeIdleConnections() to close idle connections,
 * and the plugin will close any other connections 10 seconds later.
 */
export function fastifyApolloDrainPlugin<Context extends BaseContext>(
  fastify: FastifyInstance,
): ApolloServerPlugin<Context> {
  return {
    serverWillStart() {
      return Promise.resolve({
        async drainServer() {
          // `closeAllConnections` was added in v18.2 - @types/node are v16.
          const timeout = setTimeout(() => {
            fastify.server.closeAllConnections();
          }, 10_000);
          await fastify.close();
          clearTimeout(timeout);
        },
      });
    },
  };
}
