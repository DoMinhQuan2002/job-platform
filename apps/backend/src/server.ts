import dotenv from "dotenv";
import app from "./app";
import { AppDataSource } from "./data-source";
import { startScheduler } from "./jobs/scheduler";

dotenv.config();

const port = Number(process.env.PORT || 4000);

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");
    startScheduler();

    app.listen(port, () => {
      console.log(`Backend listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
};

void startServer();
