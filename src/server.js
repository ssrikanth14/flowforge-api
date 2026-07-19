import app from "./app.js";
import connectDB from "./config/database.js";
import env from "./config/env.js";

const startServer = async () => {
  try {
    // Connect Database
    await connectDB();

    // Start Express Server
    app.listen(env.port, () => {
      console.log("====================================");
      console.log("🚀 FlowForge API Started");
      console.log(`🌍 Environment : ${env.nodeEnv}`);
      console.log(`📦 Port        : ${env.port}`);
      console.log(`🔗 URL         : http://localhost:${env.port}`);
      console.log("====================================");
    });
  } catch (error) {
    console.error("❌ Failed to start application");
    console.error(error);

    process.exit(1);
  }
};

startServer();