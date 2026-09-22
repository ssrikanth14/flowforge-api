import app from "./app.js";
import connectDB from "./config/database.js";
import env from "./config/env.js";

const startServer = async () => {
  try {
    // Connect Database
    await connectDB();

    // Start Express Server
    const server = app.listen(env.port, () => {
      console.log("====================================");
      console.log("🚀 FlowForge API Started");
      console.log(`🌍 Environment : ${env.nodeEnv}`);
      console.log(`📦 Port        : ${env.port}`);
      console.log(`🔗 URL         : http://localhost:${env.port}`);
      console.log("====================================");
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Closing server.`);
      server.close(async () => {
        const mongoose = await import("mongoose");
        await mongoose.default.connection.close();
        process.exit(0);
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Failed to start application");
    console.error(error);

    process.exit(1);
  }
};

startServer();