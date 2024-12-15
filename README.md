# csv-upload-data-manager

## Overview

This project consists of a backend API and a frontend application. The backend serves on port `3000` and the frontend on port `5173`. The project allows uploading files, listing data from a database, and searching through records by various fields.

## Setup Instructions

### Backend

1. Navigate to the backend folder.
2. Install dependencies:
   ```bash
   npm install
   ```


### Frontend
1. Navigate to the frontend folder.
2. Install dependencies:
   ```
   npm install
   ```

## Start the application
In the root folder, run the following command:
   ```
   npm run dev
   ```
The backend will run on http://localhost:3000 and the frontend will run on http://localhost:5173. Head to http://localhost:5173 to view the application.

### API Endpoints
1. GET /api/data/health
Description: Check the health of the server.
Response: Returns 200 OK if the server is healthy.

2. POST /api/data/upload
Description: Upload a file as multipart.

Form Parameter:
* file: The binary file to be uploaded.

| Example request       | Expected response       |
|----------------|----------------|
| POST /api/data/upload <br><br> With the form-data parameter file containing the binary file. | Returns a success message or error depending on the upload status. |

3. GET /api/data/search
Description: Search for records where name, email, or body contains the query string.

Query Parameters:

* queryString (optional): The search query string. If not provided, defaults to returning page 1 of the data with a limit of 10 results.

| Example request       | Expected response       |
|----------------|----------------|
| GET /api/data/search?queryString=example | Returns the records that match the search query. Default page 1, limit 10 results. |
| GET /api/data/search?queryString=example?page=2&limit=10 | Returns the records that match the search query. Page 2, limit 10 results. |

## Testing the application
Unit tests have been written for the backend controllers.

1. Navigate to the backend folder.
2. Run tests
   ```bash
   npm run test
   ```