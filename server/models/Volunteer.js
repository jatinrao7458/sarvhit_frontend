const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    zipCode: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    focusAreas: [
      {
        type: String,
        enum: ['Environment', 'Education', 'Healthcare', 'Community', 'Animal Welfare', 'Disaster Relief'],
        trim: true,
      },
    ],
    volunteerHours: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
      },
    ],
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for search performance
volunteerSchema.index({ firstName: 'text', lastName: 'text', city: 'text' });

module.exports = mongoose.model('Volunteer', volunteerSchema);
