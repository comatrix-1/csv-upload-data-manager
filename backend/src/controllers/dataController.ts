import { Request, Response } from "express";
import { initDb } from "../db";

export const getData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const db = await initDb();

    const totalRecords = await db.get("SELECT COUNT(*) AS count FROM data");
    const totalPages = Math.ceil(
      totalRecords.count / parseInt(limit as string)
    );

    const data = await db.all("SELECT * FROM data LIMIT ? OFFSET ?", [
      parseInt(limit as string),
      (parseInt(page as string) - 1) * parseInt(limit as string),
    ]);

    res.status(200).json({
      data,
      totalRecords: totalRecords.count,
      totalPages,
      currentPage: parseInt(page as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    res.status(500).send({ error: "Error while fetching data" });
  }
};
