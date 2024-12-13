# csv-upload-data-manager

# Project Name

## Overview

This project consists of a backend API and a frontend application. The backend serves on port `3000` and the frontend on port `5173`. The project allows uploading files, listing data from a database, and searching through records by various fields.

## Setup Instructions

### Backend

1. Navigate to the backend folder.
2. Install dependencies:
   ```bash
   npm install
Start the backend server:
bash
Copy code
npm start
The backend will run on http://localhost:3000.
Frontend
Navigate to the frontend folder.
Install dependencies:
bash
Copy code
npm install
Start the frontend server:
bash
Copy code
npm run dev
The frontend will run on http://localhost:5173.
API Endpoints
1. GET /api/data/health
Description: Check the health of the server.
Response: Returns 200 OK if the server is healthy.
2. GET /api/data/list
Description: List data from the database.
Parameters:
page (optional): The page number for pagination. Defaults to 1.
limit (optional): The number of results per page. Defaults to 10.
Example Request:
http
Copy code
GET /api/data/list?page=1&limit=10
Response: Returns a list of data.
3. POST /api/data/upload
Description: Upload a file as multipart.

Form Parameter:

file: The binary file to be uploaded.
Example Request:

http
Copy code
POST /api/data/upload
With the form-data parameter file containing the binary file.

Response: Returns a success message or error depending on the upload status.

4. GET /api/data/search
Description: Search for records where name, email, or body contains the query string.
Query Parameters:
queryString (optional): The search query string. If not provided, defaults to returning page 1 of the data with a limit of 10 results.
Example Request:
http
Copy code
GET /api/data/search?queryString=example
Response: Returns the records that match the search query.