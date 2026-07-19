import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET"
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
});

const env = {
  port: Number(process.env.PORT) || 5000,

  nodeEnv: process.env.NODE_ENV || "development",

  mongoURI: process.env.MONGODB_URI,

  jwtSecret: process.env.JWT_SECRET,

  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,

  cookieExpiresIn: Number(process.env.COOKIE_EXPIRES_IN) || 7,
};

export default env;