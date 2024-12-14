import { Request, Response } from "express";
import { initDb } from "../db";

export const searchData = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("searchData()");
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const queryString = req.query.queryString as string;
    console.log("searchData() :: page", page);
    console.log("searchData() :: limit", limit);
    console.log("searchData() :: queryString", queryString);

    const db = await initDb();

    let query = "SELECT COUNT(*) AS count FROM data WHERE 1=1";
    const queryParams: any[] = [];

    if (queryString?.length) {
      query += " AND (name LIKE ? OR email LIKE ? OR body LIKE ?)";
      const searchTerm = `%${queryString}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const totalRecords = await db.get(query, queryParams);

    const totalPages = Math.ceil(totalRecords.count / limit);

    const offset = (page - 1) * limit;
    query = query.replace("COUNT(*) AS count", "*") + " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    const data = await db.all(query, queryParams);

    res.status(200).json({
      data,
      totalRecords: totalRecords.count,
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error while searching data" });
  }
};
