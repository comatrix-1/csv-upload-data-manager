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
  const limit = 10;
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query
  const [file, setFile] = useState<File | null>(null); // Selected file for CSV upload
  const [uploading, setUploading] = useState<boolean>(false); // Uploading state
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/data/search`, {
        params: {
          queryString: debouncedSearchQuery,
          page: currentPage,
          limit,
        },
      });

      const responseData = res.data;

      if (Array.isArray(responseData.data)) {
        setData(responseData.data);
        setTotalPages(Math.ceil(responseData.totalPages / limit));
      } else {
        console.error("Received data is not an array:", responseData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      fetchData();
    }
  }, [debouncedSearchQuery, currentPage, limit]);

  const handlePaginationChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

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
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 w-vh-100">
      <h1 className="text-center mb-4">Data List</h1>

      <Form className="mb-4 w-50">
        <Form.Group controlId="fileUpload" className="mb-3">
          <Form.Label>Upload CSV</Form.Label>
          <Form.Control type="file" accept=".csv" onChange={handleFileChange} />
        </Form.Group>
        <Button
          variant="primary"
          onClick={handleFileUpload}
          disabled={uploading || !file}
          className="w-100"
        >
          {uploading ? "Uploading..." : "Upload CSV"}
        </Button>
      </Form>

      <Form.Control
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="mb-4 w-50"
      />

      {isLoading ? (
        <Spinner animation="border" variant="primary" role="status" />
      ) : data.length === 0 ? (
        <Alert variant="warning">No data available.</Alert>
      ) : (
        <>
          <Table striped bordered hover className="w-75 text-center">
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

          <Pagination className="mt-4">
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
