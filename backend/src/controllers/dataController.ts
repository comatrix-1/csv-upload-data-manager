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
    const queryString = req.query.queryString?.toString() || ""; // Default to an empty string if not provided
    console.log("searchData() :: page", page);
    console.log("searchData() :: limit", limit);
    console.log("searchData() :: queryString", queryString);

    const db = await initDb();

    let countQuery = "SELECT COUNT(*) AS count FROM data WHERE 1=1";
    const countQueryParams: any[] = [];

    if (queryString.length > 0) {
      countQuery += " AND (name LIKE ? OR email LIKE ? OR body LIKE ?)";
      const searchTerm = `%${queryString}%`;
      countQueryParams.push(searchTerm, searchTerm, searchTerm);
    }

    console.log("searchData() :: getting total results");
    const totalRecords = await db.get(countQuery, countQueryParams);
    const totalPages = Math.ceil(totalRecords.count / limit);

    const offset = (page - 1) * limit;
    let dataQuery = "SELECT * FROM data WHERE 1=1";
    const dataQueryParams = [...countQueryParams];

    if (queryString.length > 0) {
      dataQuery += " AND (name LIKE ? OR email LIKE ? OR body LIKE ?)";
    }

    dataQuery += " LIMIT ? OFFSET ?";
    dataQueryParams.push(limit, offset);

    console.log("searchData() :: final dataQuery", dataQuery);
    const data = await db.all(dataQuery, dataQueryParams);

    console.log("searchData() :: data", data);

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
    res.status(500).send({ error: "Error while searching data" });
  }
};
