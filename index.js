import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./schema.js"; // Import typeDefs and resolvers
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
  typeDefs,
  resolvers, // Add resolvers to the server
});

await server.start();
server.applyMiddleware({ app });

app.listen({ port: PORT }, () => {
  console.log(`🚀 Server is ready at http://localhost:${PORT}${server.graphqlPath}`);
});
