import express from "express";
import cors from "cors";
import { dataRouter } from "./routes/dataRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/data", dataRouter);

export { app };
