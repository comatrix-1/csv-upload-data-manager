import request from "supertest";
import path from "path";
import { app } from "../app"; // Import the app for testing
import { initDb } from "../db";

describe("Upload CSV", () => {
  let db: any;

  // Reset database before each test
  beforeEach(async () => {
    db = await initDb(); // Initialize the database connection
    await db.run("DELETE FROM data"); // Clear any existing data
  });

  it("should upload and parse a CSV file", async () => {
    const response = await request(app)
      .post("/api/data/upload")
      .attach("file", path.resolve(__dirname, "data.csv"))
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "File uploaded and data saved to database successfully!"
    );
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("should return error when no file is uploaded", async () => {
    const response = await request(app)
      .post("/api/data/upload")
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body.message).toBe("No file uploaded");
  });
});
