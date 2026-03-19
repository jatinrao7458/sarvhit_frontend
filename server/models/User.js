const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    userType: {
      type: String,
      enum: ['ngo', 'volunteer', 'sponsor'],
      required: true
    },
    profileImage: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      default: null
    },
    address: {
      type: String,
      default: null
    },
    city: {
      type: String,
      default: null
    },
    state: {
      type: String,
      default: null
    },
    zipCode: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      default: null
    },
    skills: [
      {
        type: String,
        trim: true
      }
    ],
    focusAreas: [
      {
        type: String,
        enum: ['Environment', 'Education', 'Healthcare', 'Community', 'Animal Welfare', 'Disaster Relief'],
        trim: true
      }
    ],
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
      }
    ],
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    verificationToken: {
      type: String,
      default: null
    },
    isVerified: {
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user data without password
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  return user;
};

module.exports = mongoose.model('User', userSchema);
