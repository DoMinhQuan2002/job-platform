import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config();

const sslEnabled =
  process.env.DB_SSL === "true" || process.env.DB_SSL === "1";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "job_platform",
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  entities: [__dirname + "/database/entities/*.entity.{ts,js}"],
  synchronize: false,
});
