import { Router } from "express";
import { uploadCSV, handleUpload } from "../controllers/uploadController";
import { searchData } from "../controllers/dataController";

const router = Router();

router.post("/upload", uploadCSV, handleUpload);
router.get("/search", searchData);
router.get("/health", (req, res) => {
  res.status(200).json({ status: "Server is up and running" });
});

export { router as dataRouter };
