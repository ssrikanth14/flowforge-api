import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";
import routes from "./routes/index.js";
import authRoutes from "./routes/auth.routes.js";
const app = express();

/**
 * Built-in Middleware
 */

// Parse incoming JSON
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Enable Cross-Origin Resource Sharing
app.use(cors({
	origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",") : true,
	credentials: true,
}));

app.get("/", (req, res) => {
	res.status(200).json({
		success: true,
		name: "FlowForge API",
		version: "v1",
		docs: "/api/v1",
		health: "/api/v1/health",
	});
});

/**
 * API Routes
 */

app.use("/api/v1", routes);
app.use("/api/v1/auth", authRoutes);
app.use((req, res) => {
	res.status(404).json({ success: false, message: "Route not found." });
});
app.use(errorMiddleware);
export default app;