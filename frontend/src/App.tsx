import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Pagination,
  Spinner,
  Alert,
  Button,
  Form,
} from "react-bootstrap";

const App = () => {
  const [data, setData] = useState<any[]>([]); // Data to display in the table
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page number
  const [totalPages, setTotalPages] = useState<number>(0); // Total pages
  const [limit, setLimit] = useState<number>(10); // Number of items per page
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query
  const [file, setFile] = useState<File | null>(null); // Selected file for CSV upload
  const [uploading, setUploading] = useState<boolean>(false); // Uploading state
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');

  // Fetch data from the backend, including search query
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/data/search`, {
        params: {
          queryString: searchQuery,
          page: currentPage,
          limit,
        },
      });

      if (Array.isArray(res.data)) {
        setData(res.data);
        setTotalPages(Math.ceil(res.data.length / limit));
      } else {
        console.error("Received data is not an array:", res.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery); // Set the debounced query
    }, 500); // Adjust the delay as needed (500ms is common for debounce)

    // Clean up the timeout when searchQuery changes
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      fetchData();
    }
  }, [currentPage, limit, debouncedSearchQuery]);

  // Fetch data on initial load and when the page, limit, or search query changes
  useEffect(() => {
    fetchData();
  }, [currentPage, limit, searchQuery]);

  // Handle page change for pagination
  const handlePaginationChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page when search query changes
  };

  // Handle file input change for CSV upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  // Handle CSV file upload
  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a CSV file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await axios.post("/api/data/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert("CSV file uploaded successfully!");
        // After successful upload, fetch the latest data
        fetchData();
      } else {
        alert("Error uploading CSV file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading CSV file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <h1>Data List</h1>

      {/* CSV Upload Form */}
      <Form>
        <Form.Group controlId="fileUpload" className="mb-3">
          <Form.Label>Upload CSV</Form.Label>
          <Form.Control type="file" accept=".csv" onChange={handleFileChange} />
        </Form.Group>
        <Button
          variant="primary"
          onClick={handleFileUpload}
          disabled={uploading || !file}
        >
          {uploading ? "Uploading..." : "Upload CSV"}
        </Button>
      </Form>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="form-control mb-3"
      />

      {/* Loading Spinner */}
      {isLoading ? (
        <Spinner animation="border" variant="primary" />
      ) : data.length === 0 ? (
        <Alert variant="warning">No data available.</Alert>
      ) : (
        <>
          {/* Table displaying the data */}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Post ID</th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Body</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.postId}</td>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.body}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination Component */}
          <Pagination>
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={currentPage === index + 1}
                onClick={() => handlePaginationChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      )}
    </div>
  );
};

export default App;
