import request from "supertest";
import express from "express";
import { searchData } from "../controllers/dataController";
import { initDb } from "../db";

jest.mock("../db", () => ({
  initDb: jest.fn(),
}));

describe("dataController tests", () => {
  let app: express.Application;
  let dbInstance: any;

  beforeAll(async () => {
    app = express();
    app.get("/search", searchData);

    dbInstance = {
      get: jest.fn(),
      all: jest.fn(),
      exec: jest.fn(),
    };
    (initDb as jest.Mock).mockResolvedValue(dbInstance);

    // Mock the database schema
    dbInstance.get.mockResolvedValue({ count: 100 });
    dbInstance.all.mockResolvedValue([
      {
        post_id: 1,
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        body: "Sample body 1",
      },
      {
        post_id: 2,
        id: 2,
        name: "Jane Doe",
        email: "jane@example.com",
        body: "Sample body 2",
      },
    ]);
  });

  it("should return paginated search results", async () => {
    const response = await request(app)
      .get("/search")
      .query({ page: "1", limit: "10", queryString: "John" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [
        {
          postId: 1,
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          body: "Sample body 1",
        },
        {
          postId: 2,
          id: 2,
          name: "Jane Doe",
          email: "jane@example.com",
          body: "Sample body 2",
        },
      ],
      totalRecords: 100,
      totalPages: 10,
      currentPage: 1,
      limit: 10,
    });

    expect(dbInstance.get).toHaveBeenCalledWith(
      "SELECT COUNT(*) AS count FROM data WHERE 1=1 AND (name LIKE ? OR email LIKE ? OR body LIKE ?)",
      ["%John%", "%John%", "%John%"]
    );
    expect(dbInstance.all).toHaveBeenCalledWith(
      "SELECT * FROM data WHERE 1=1 AND (name LIKE ? OR email LIKE ? OR body LIKE ?) LIMIT ? OFFSET ?",
      ["%John%", "%John%", "%John%", 10, 0]
    );
  });

  it("should return empty data if no query string matches", async () => {
    dbInstance.all.mockResolvedValue([]);

    const response = await request(app)
      .get("/search")
      .query({ page: "1", limit: "10", queryString: "NotExist" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [],
      totalRecords: 100,
      totalPages: 10,
      currentPage: 1,
      limit: 10,
    });
  });

  it("should handle errors gracefully", async () => {
    (dbInstance.get as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(app)
      .get("/search")
      .query({ page: "1", limit: "10", queryString: "John" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Error while searching data" });
  });
});
