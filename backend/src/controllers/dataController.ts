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
    console.log("searchData() :: db", db);
    
    let query = "SELECT COUNT(*) AS count FROM data WHERE 1=1";
    const queryParams: any[] = [];

    if (queryString?.length) {
      query += " AND (name LIKE ? OR email LIKE ? OR body LIKE ?)";
      const searchTerm = `%${queryString}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const totalRecords = await db.get(query, queryParams);

    console.log("searchData() :: totalRecords :: " + totalRecords);
    
    const totalPages = Math.ceil(totalRecords.count / limit);
    
    const offset = (page - 1) * limit;
    query = query.replace("COUNT(*) AS count", "*") + " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);
    
    const data = await db.all(query, queryParams);
    console.log("searchData() :: data :: " + data);

    const transformedData = data.map((row: any) => ({
      postId: row.post_id,
      id: row.id,
      name: row.name,
      email: row.email,
      body: row.body,
    }));

    res.status(200).json({
      data: transformedData,
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
