import { app } from "./app";
import { initDb } from "./db";

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Initialize the database
    await initDb();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error while starting the server:", error);
    process.exit(1); // Exit the process if there's an initialization error
  }
})();
