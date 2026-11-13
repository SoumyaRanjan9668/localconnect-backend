
import app from "./app.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./config/database.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = async () => {
      console.log("Shutting down server...");

      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error);
    await disconnectDatabase();
    process.exit(1);
  }
};

startServer();
