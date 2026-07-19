import express from "express";
import cors from "cors";

import routes from "./routes/index.js";

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

export default app;