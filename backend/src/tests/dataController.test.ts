import request from "supertest";
import { app } from "../app";
import { initDb } from "../db";

jest.mock("../db");

describe("Data Controller", () => {
  let mockDb: any;

  beforeAll(async () => {
    // Mock the `initDb` function to return a test database instance
    mockDb = {
      all: jest.fn(),
      get: jest.fn(), // Mock the `get` method for count query
      exec: jest.fn(),
    };
    (initDb as jest.Mock).mockResolvedValue(mockDb);

    // Seed the mocked database
    mockDb.exec.mockResolvedValueOnce(undefined); // Simulating a successful execution
    await mockDb.exec(`
      INSERT INTO data (name, value)
      VALUES
        ('Item 1', 'Value 1'),
        ('Item 2', 'Value 2'),
        ('Item 3', 'Value 3'),
        ('Item 4', 'Value 4'),
        ('Item 5', 'Value 5');
    `);
  });

  afterAll(async () => {
    // Cleanup: Reset the database
    mockDb.exec.mockResolvedValueOnce(undefined); // Simulating a successful cleanup
    await mockDb.exec("DELETE FROM data");
  });

  it("should fetch paginated data with total records and pages", async () => {
    // Mock the `get` method for the total records count query
    mockDb.get.mockResolvedValueOnce({ count: 5 });

    // Mock the `all` method to return test data for the first page
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
    expect(response.body.totalPages).toBe(2); // 5 items, 3 per page = 2 pages
    expect(response.body.currentPage).toBe(1);
    expect(response.body.limit).toBe(3);
  });

  it("should return an error if an issue occurs while fetching data", async () => {
    jest.spyOn(global.console, "error").mockImplementation(() => {}); // Suppress console errors in test output

    // Mock `initDb` to simulate a database error
    (initDb as jest.Mock).mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .get("/api/data/list")
      .expect("Content-Type", /json/)
      .expect(500);

    expect(response.body.error).toBe("Error while fetching data");
  });
});
