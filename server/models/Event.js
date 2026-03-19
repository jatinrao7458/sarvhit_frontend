const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    cause: {
      type: String,
      required: true,
      enum: ['Environment', 'Education', 'Healthcare', 'Community', 'Other'],
      default: 'Other'
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      default: ''
    },
    societyImpact: {
      type: String,
      default: ''
    },
    volunteerRole: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: '🎯'
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    orgName: {
      type: String,
      required: true,
      trim: true
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    spots: {
      type: Number,
      required: true,
      min: 1
    },
    filled: {
      type: Number,
      default: 0,
      min: 0
    },
    fundGoal: {
      type: Number,
      default: 0,
      min: 0
    },
    fundRaised: {
      type: Number,
      default: 0,
      min: 0
    },
    highlights: [{
      type: String
    }],
    impactStats: [{
      label: String,
      value: String
    }],
    volunteers: [{
      volunteerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'joined', 'completed'],
        default: 'joined'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    sponsors: [{
      sponsorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      amount: {
        type: Number,
        default: 0
      },
      fundedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isPublished: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
