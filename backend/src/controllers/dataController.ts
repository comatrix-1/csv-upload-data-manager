import { Request, Response } from "express";
import { initDb } from "../db";

export const getData = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page <= 0 || limit <= 0) {
      res
        .status(400)
        .json({ error: "Page and limit must be positive integers" });
      return; // Ensure no further execution
    }

    const db = await initDb();
    const data = await db.all("SELECT * FROM data LIMIT ? OFFSET ?", [
      limit,
      (page - 1) * limit,
    ]);

    res.status(200).json(data); // Sends the response
  } catch (error) {
    console.error("Error while fetching data:", error);
    res.status(500).json({ error: "Error while fetching data" }); // Handles the error response
  }
};
