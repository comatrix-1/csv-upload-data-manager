import React, { useState } from "react";
import {
  Container,
  Button,
  Form,
  Table,
  Pagination,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle CSV upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await axios.post("/api/data/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: ProgressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
          }
        },
      });

      if (res.status === 200) {
        fetchData();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/data/list`, {
        params: { page, limit, search: searchQuery },
      });

      if (Array.isArray(res.data)) {
        setData(res.data);
      } else {
        console.error("Received data is not an array:", res.data);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handlePaginationChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

  return (
    <Container className="mt-4">
      <h1>CSV File Upload and Data List</h1>

      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Upload CSV File</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} />
      </Form.Group>

      <Button variant="primary" onClick={handleUpload} disabled={isUploading}>
        {isUploading ? <Spinner animation="border" size="sm" /> : "Upload"}
      </Button>
      {isUploading && <div>Uploading: {uploadProgress}%</div>}

      <Form.Group className="my-4">
        <Form.Label>Search Data</Form.Label>
        <Form.Control
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearch}
        />
      </Form.Group>

      {isLoading ? (
        <Spinner animation="border" variant="primary" />
      ) : data.length === 0 ? (
        <Alert variant="warning">No data available.</Alert>
      ) : (
        <>
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
              {data?.map((item: any) => (
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

          <Pagination>
            {Array.from(
              { length: Math.ceil(data.length / limit) },
              (_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={page === index + 1}
                  onClick={() => handlePaginationChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              )
            )}
          </Pagination>
        </>
      )}
    </Container>
  );
};

export default App;
