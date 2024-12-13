import request from "supertest";
import { app } from "../app";
import { initDb } from "../db";

jest.mock("../db");

describe("Data Controller", () => {
  let mockDb: any;

  beforeAll(async () => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn(),
      exec: jest.fn(),
    };
    (initDb as jest.Mock).mockResolvedValue(mockDb);

    mockDb.exec.mockResolvedValueOnce(undefined);
    await mockDb.exec(`
      INSERT INTO data (name, value, email, body)
      VALUES
        ('Item 1', 'Value 1', 'item1@example.com', 'Body of Item 1'),
        ('Item 2', 'Value 2', 'item2@example.com', 'Body of Item 2'),
        ('Item 3', 'Value 3', 'item3@example.com', 'Body of Item 3'),
        ('Item 4', 'Value 4', 'item4@example.com', 'Body of Item 4'),
        ('Item 5', 'Value 5', 'item5@example.com', 'Body of Item 5');
    `);
  });

  afterAll(async () => {
    mockDb.exec.mockResolvedValueOnce(undefined);
    await mockDb.exec("DELETE FROM data");
  });

  it("should fetch paginated data with total records and pages", async () => {
    mockDb.get.mockResolvedValueOnce({ count: 5 });
    mockDb.all.mockResolvedValueOnce([
      { name: "Item 1", value: "Value 1" },
      { name: "Item 2", value: "Value 2" },
      { name: "Item 3", value: "Value 3" },
    ]);

    const response = await request(app)
      .get("/api/data/list?page=1&limit=3")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.data.length).toBe(3);
    expect(response.body.totalRecords).toBe(5);
    expect(response.body.totalPages).toBe(2);
    expect(response.body.currentPage).toBe(1);
    expect(response.body.limit).toBe(3);
  });

  it("should return an error if an issue occurs while fetching data", async () => {
    jest.spyOn(global.console, "error").mockImplementation(() => {});
    (initDb as jest.Mock).mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .get("/api/data/list")
      .expect("Content-Type", /json/)
      .expect(500);

    expect(response.body.error).toBe("Error while fetching data");
  });

  it("should search data by a single query string across name, email, and body", async () => {
    mockDb.all.mockResolvedValueOnce([
      { post_id: "1", id: "1", name: "Item 1", email: "item1@example.com", body: "Body of Item 1" },
      { post_id: "2", id: "2", name: "Item 2", email: "item2@example.com", body: "Body of Item 2" },
    ]);
  
    const response = await request(app)
      .get("/api/data/search?queryString=Item") // Search by a term that may match name, email, or body
      .expect("Content-Type", /json/)
      .expect(200);
  
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toMatchObject({
      post_id: "1",
      id: "1",
      name: "Item 1",
      email: "item1@example.com",
      body: "Body of Item 1",
    });
    expect(response.body[1]).toMatchObject({
      post_id: "2",
      id: "2",
      name: "Item 2",
      email: "item2@example.com",
      body: "Body of Item 2",
    });
  });
  

  it("should return an empty array when no matches are found for the query string", async () => {
    mockDb.all.mockResolvedValueOnce([]);

    const response = await request(app)
      .get("/api/data/search?queryString=NonExistentTerm")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it("should return an error if no query string is provided", async () => {
    const response = await request(app)
      .get("/api/data/search")
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body.error).toBe("Query string is required");
  });
});
