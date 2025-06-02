// src/index.js
require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const typeDefs = require("./graphql/schemas/user.schema");
const resolvers = require("./graphql/resolvers/user.resolver");
const auth = require("./middlewares/auth.middleware");

const app = express();
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async (connection) => {
    console.log("MongoDB connected");
    // Uncomment the following line to drop the database on startup
    // connection.connection.db.dropDatabase();
    // console.log("Database dropped");
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req }) => {
        const user = await auth(req);
        return { user };
      },
    });

    await server.start()
    server.applyMiddleware({ app });

    app.get('/health', (req, res) => {
      res.json({ status: 'OK', uptime: process.uptime(), timestamp: Date.now() });
    });

    app.listen({ port: process.env.PORT || 4000 }, () =>
      console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
