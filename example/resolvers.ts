import { MyContext } from "./context";

export const resolvers = {
  Query: {
    helloWorld: (parent, args, context: MyContext, info) => context.greeting,
  },
};
