import type { IncomingHttpHeaders } from "node:http";
import { HeaderMap, type HTTPGraphQLRequest } from "@apollo/server";
import type { FastifyRequest } from "fastify";

const httpHeadersToMap = (headers: IncomingHttpHeaders) => {
  const map = new HeaderMap();

  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      map.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }

  return map;
};

export const fastifyRequestToGraphQLRequest = (
  request: FastifyRequest,
): HTTPGraphQLRequest => ({
  body: request.body,
  method: request.method.toUpperCase(),
  headers: httpHeadersToMap(request.headers),
  search: new URL(request.url, `${request.protocol}://${request.hostname}/`)
    .search,
});
