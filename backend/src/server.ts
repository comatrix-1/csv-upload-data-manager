import express from "express";
import { json } from "body-parser";

const app = express();

app.use(json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
