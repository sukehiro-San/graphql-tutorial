// src/graphql/resolvers.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');

module.exports = {
  Query: {
    me: async (_, __, { user }) => user,
    users: async (_, __, { user }) => {
      if (!user || user.role !== 'ADMIN') throw new Error('Not authorized');
      return User.find();
    },
    user: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return User.findById(id);
    }
  },
  Mutation: {
    register: async (_, { name, email, password }) => {
      console.log('Registering user:', { name, email, password });
      const user = new User({ name, email, password });
      await user.save();
      console.log('User registered:', user);
      const token = await jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      console.log('Generated token:', token);
      return { token, user };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('No user found');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid password');
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return { token, user };
    },
    updateUser: async (_, { id, ...args }, { user }) => {
      if (!user || (user.id !== id && user.role !== 'ADMIN')) throw new Error('Not authorized');
      if (args.password) args.password = await bcrypt.hash(args.password, 12);
      return User.findByIdAndUpdate(id, args, { new: true });
    },
    deleteUser: async (_, { id }, { user }) => {
      if (!user || user.role !== 'ADMIN') throw new Error('Not authorized');
      return User.findByIdAndDelete(id);
    }
  }
};
