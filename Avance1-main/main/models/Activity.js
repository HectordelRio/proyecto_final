const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    importance: {
      type: String,
      enum: ['alta', 'media', 'baja'],
      default: 'media',
    },
    done: {
      type: Boolean,
      default: false,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    // Opcional: quién creó la actividad
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);
