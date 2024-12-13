import { Request, Response } from "express";
import { initDb } from "../db";

export const getData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const db = await initDb();
    const data = await db.all("SELECT * FROM data LIMIT ? OFFSET ?", [
      parseInt(limit as string),
      (parseInt(page as string) - 1) * parseInt(limit as string),
    ]);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).send({ error: "Error while fetching data" });
  }
};
