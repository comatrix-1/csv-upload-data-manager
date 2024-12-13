import { Request, Response } from "express";
import multer from "multer";
import Papa from "papaparse";
import { initDb } from "../db"; // Import database initializer

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload CSV middleware
export const uploadCSV = upload.single("file");

// Handle CSV file upload and parsing
export const handleUpload = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  const csvData = req.file.buffer.toString("utf-8");

  Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    complete: async (result) => {
      try {
        const db = await initDb();

        // Validate and prepare data for insertion
        const preparedData = result.data.map((row: any) => [
          parseInt(row.postId, 10),
          parseInt(row.id, 10),
          row.name,
          row.email,
          row.body,
        ]);

        // Insert data into the database
        const placeholders = preparedData
          .map(() => "(?, ?, ?, ?, ?)")
          .join(", ");
        const insertQuery = `
          INSERT INTO data (post_id, id, name, email, body) VALUES ${placeholders};
        `;

        await db.run(insertQuery, preparedData.flat());

        res.status(200).json({
          success: true,
          message: "File uploaded and data saved to database successfully!",
          data: result.data,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: "Error saving data to the database",
          error: error.message,
        });
      }
    },
    error: (error: any) => {
      res.status(500).json({ message: "Error parsing CSV file", error });
    },
  });
};
