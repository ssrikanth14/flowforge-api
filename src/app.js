import express from "express";
import cors from "cors";
import errorMiddleware from "./middleware/error.middleware.js";
import routes from "./routes/index.js";
import authRoutes from "./routes/auth.routes.js";
const app = express();

/**
 * Built-in Middleware
 */

// Parse incoming JSON
app.use(express.json());

// Enable Cross-Origin Resource Sharing
app.use(cors());

/**
 * API Routes
 */

app.use("/api/v1", routes);
app.use("/api/v1/auth", authRoutes);
app.use(errorMiddleware);
export default app;