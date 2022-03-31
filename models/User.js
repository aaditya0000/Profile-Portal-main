const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  wano: {
    type: String
  },
  verifiedEmail: {
    type: String,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  hostel: {
    type: String
  },
  gradyr: {
    type: String
  },
  interests: {
    type: Array
  },
  pors: {
    type: Array
  },
  skill_1: {
    type: String
  },
  skill_1_value: {
    type: String
  },
  skill_2: {
    type: String
  },
  skill_2_value: {
    type: String
  },
  skill_3: {
    type: String
  },
  skill_3_value: {
    type: String
  },
  linkedinLink: {
    type: String
  },
  fbLink: {
    type: String
  },
  instaLink: {
    type: String
  },
  emailToken: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
      type: String,
      required: false
  },
  resetPasswordExpires: {
      type: Date,
      required: false
  }
}, { timestamps: true });

// hashing Password
userSchema.pre('save', async function(next){
  // preventing password from rehashing if its not modified
  if (!this.isModified('password')) return next();

  console.log(this.isModified('password'));
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password,salt);
  next();
});

// static method to login user
userSchema.statics.login = async function(verifiedEmail, password) {
  const user = await this.findOne({ verifiedEmail });
  if (user) {
    if(user.isVerified === true){
      const auth = await bcrypt.compare(password, user.password);
      console.log(auth);
      if (auth) {
        return user;
      }
      throw Error('incorrect password');
    }
    throw Error('incorrect email');
   }
  throw Error('incorrect email');
};

userSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(64).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in 1 hour
};

const User = mongoose.model('profile', userSchema);

module.exports = User;
