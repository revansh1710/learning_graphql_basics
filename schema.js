import mongoose from "mongoose";
import { gql } from "apollo-server-express";
import dotenv from "dotenv";

dotenv.config();

// MongoDB URI
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mongoose Schemas
const gameSchema = new mongoose.Schema({
  games_id: { type: String, required: true },
  title: { type: String, required: true },
  platform: { type: [String], required: true },
});

const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true },
  rating: { type: Number, required: true },
  content: { type: String, required: true },
  game_id: { type: String, required: true },
  author_id: { type: String, required: true },
});

const authorSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  verified: { type: Boolean, required: true },
});

// Mongoose Models
export const Game = mongoose.model("Game", gameSchema);
export const Review = mongoose.model("Review", reviewSchema);
export const Author = mongoose.model("Author", authorSchema);

// GraphQL Type Definitions
export const typeDefs = gql`
  type Game {
    games_id: String!
    title: String!
    platform: [String!]!
    reviews: [Review!]
  }

  type Review {
    id: String!
    rating: Int!
    content: String!
    game: Game!
    author: Author!
  }

  type Author {
    id: String!
    name: String!
    verified: Boolean!
    reviews: [Review!]
  }

  type Query {
    reviews: [Review]
    games: [Game]
    authors: [Author]
    review(id: String!): Review
    author(id: String!): Author
    game(games_id: String!): Game
  }

  type Mutation {
    addGame(title: String!, platform: [String!]!): Game
    addReview(rating: Int!, content: String!, game_id: String!, author_id: String!): Review
    addAuthor(name: String!, verified: Boolean!): Author
    deleteGame(games_id: String!): String
    updateGame(games_id: String!, title: String, platform: [String!]): Game
  }
`;

// Resolvers
// Resolvers
export const resolvers = {
  Query: {
    reviews: async () => await Review.find(),
    games: async () => await Game.find(),
    authors: async () => await Author.find(),
    review: async (_, args) => await Review.findOne({ id: args.id }),
    author: async (_, args) => await Author.findOne({ id: args.id }),
    game: async (_, args) => await Game.findOne({ games_id: args.games_id }),
  },
  Game: {
    reviews: async (parent) => await Review.find({ game_id: parent.games_id }),
  },
  Author: {
    reviews: async (parent) => await Review.find({ author_id: parent.id }),
  },
  Review: {
    game: async (parent) => await Game.findOne({ games_id: parent.game_id }),
    author: async (parent) => await Author.findOne({ id: parent.author_id }),
  },
  Mutation: {
    addGame: async (_, { title, platform }) => {
      const game = new Game({
        games_id: new mongoose.Types.ObjectId().toString(),
        title,
        platform,
      });
      return await game.save();
    },
    addReview: async (_, { rating, content, game_id, author_id }) => {
      const review = new Review({
        id: new mongoose.Types.ObjectId().toString(),
        rating,
        content,
        game_id,
        author_id,
      });
      return await review.save();
    },
    addAuthor: async (_, { name, verified }) => {
      const author = new Author({
        id: new mongoose.Types.ObjectId().toString(),
        name,
        verified,
      });
      return await author.save();
    },
    deleteGame: async (_, { games_id }) => {
      const game = await Game.findOneAndDelete({ games_id });
      if (!game) {
        throw new Error(`Game with ID ${games_id} not found.`);
      }
      return games_id;
    },
    updateGame: async (_, { games_id, title, platform }) => {
      const game = await Game.findOne({ games_id });
  
      if (!game) {
        throw new Error(`Game with ID ${games_id} not found.`);
      }
  
      if (title) game.title = title;
      if (platform) game.platform = platform;
  
      await game.save();
      return game;
    },
  },
};


// Seed Data
import { games, reviews, authors } from "./data.js";
import { platform } from "os";

const seedDatabase = async () => {
  try {
    await Game.deleteMany({});
    await Review.deleteMany({});
    await Author.deleteMany({});
    await Game.insertMany(games);
    await Review.insertMany(reviews);
    await Author.insertMany(authors);
    console.log("Database seeded with initial data!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the seed function
seedDatabase();
