import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

describe("GET /health", () => {
  it("returns service status", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      service: "backend",
    });
  });
});
