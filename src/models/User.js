import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";
import bcrypt from "bcrypt";
import { hashPassword } from "../utils/password.js";
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: true,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.DEVELOPER,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    accountLockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await hashPassword(this.password);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase().trim(),
  });
};

const User = mongoose.model("User", userSchema);

export default User;