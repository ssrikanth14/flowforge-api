import bcrypt from "bcrypt";

/**
 * Hash any sensitive value (password or refresh token)
 *
 * @param {string} value
 * @returns {Promise<string>}
 */
export const hashPassword = async (value) => {
  return bcrypt.hash(value, 12);
};

/**
 * Compare plain text with a bcrypt hash
 *
 * @param {string} plainValue
 * @param {string} hashedValue
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (
  plainValue,
  hashedValue
) => {
  return bcrypt.compare(plainValue, hashedValue);
};