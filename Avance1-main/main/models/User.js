const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    isReady: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
