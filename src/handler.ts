import { Readable } from "node:stream";
import { ApolloServer, BaseContext } from "@apollo/server";
import type { RouteHandlerMethod } from "fastify";
import { fastifyRequestToGraphQLRequest } from "./fastify-request-to-graphql-request.js";
import {
  ApolloFastifyContextFunction,
  ApolloFastifyHandlerOptions,
} from "./types.js";
import { isApolloServerLike } from "./utils.js";

export function fastifyApolloHandler<Context extends BaseContext>(
  apollo: ApolloServer<Context>,
  options?: ApolloFastifyHandlerOptions<Context>,
): RouteHandlerMethod {
  if (apollo === undefined || apollo === null || !isApolloServerLike(apollo)) {
    throw new TypeError("You must pass in an instance of `ApolloServer`.");
  }

  apollo.assertStarted("fastifyApolloHandler()");

  const defaultContext: ApolloFastifyContextFunction<Context> = () =>
    Promise.resolve({} as Context);

  const contextFunction = options?.context ?? defaultContext;

  return async (request, reply) => {
    const httpGraphQLResponse = await apollo.executeHTTPGraphQLRequest({
      httpGraphQLRequest: fastifyRequestToGraphQLRequest(request),
      context: () => contextFunction(request, reply),
    });

    const { headers, body, status } = httpGraphQLResponse;

    for (const [headerKey, headerValue] of headers) {
      void reply.header(headerKey, headerValue);
    }

    void reply.code(status === undefined ? 200 : status);

    if (body.kind === "complete") {
      return body.string;
    }

    const readable = Readable.from(body.asyncIterator);
    // @ts-ignore something wrong with the `ReplyType` but not sure what
    return reply.send(readable);
  };
}
