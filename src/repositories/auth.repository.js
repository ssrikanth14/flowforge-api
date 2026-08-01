import User from "../models/User.js";
import Session from "../models/Session.js";

const findUserByEmail = (email) =>
  User.findByEmail({email});

const createUser = (data) =>
  User.create(data);

const findUserById = (id) =>
  User.findById(id);

const createSession = (data) =>
  Session.create(data);

const findSessionById = (id) =>
  Session.findById(id);

const revokeSession = (id) =>
  Session.findByIdAndUpdate(
    id,
    {
      isRevoked: true,
    },
    {
      new: true,
    }
  );
const deleteUser = (id) =>
  User.findByIdAndDelete(id);

const updateSession = (sessionId, data) =>
  Session.findByIdAndUpdate(sessionId, data, {
    new: true,
  });

const deleteSession = (sessionId) =>
  Session.findByIdAndDelete(sessionId);

export const authRepository = {
  findUserByEmail,
  createUser,
  findUserById,
  createSession,
  findSessionById,
  revokeSession,
  deleteUser,
  updateSession,
  deleteSession,
};