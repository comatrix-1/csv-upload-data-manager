import { Request, Response } from "express";
import multer from "multer";
import Papa from "papaparse";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload CSV middleware
export const uploadCSV = upload.single("file");

// Handle CSV file upload and parsing
export const handleUpload = (req: Request, res: Response): void => {
  if (!req.file) {
    // Respond if no file is uploaded
    res.status(400).json({ message: "No file uploaded" });
    return; // Ensure no further execution after the response
  }

  const csvData = req.file.buffer.toString("utf-8");

  Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      // Here you could save the parsed data to the database or handle it as needed
      res.status(200).json({
        success: true,
        message: "File uploaded and parsed successfully!",
        data: result.data,
      });
    },
    error: (error: any) => {
      // Handle errors that occur while parsing
      res.status(500).json({ message: "Error parsing CSV file", error });
    },
  });
};
