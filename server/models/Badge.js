const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    badgeName: {
      type: String,
      required: true,
      enum: [
        'First Responder',
        'Environmental Champion',
        'Education Hero',
        'Healthcare Advocate',
        'Community Builder',
        'Volunteer Master',
        'Fundraising Star',
      ],
    },
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    criteria: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);
