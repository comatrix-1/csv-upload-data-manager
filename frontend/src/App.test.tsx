import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import App from "./App";

// Mock Axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("App Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the initial UI correctly", () => {
    render(<App />);

    expect(screen.getByText("Data List")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload CSV" })).toBeInTheDocument();
  });

  test("fetches and displays data when mounted", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            postId: 1,
            id: 1,
            name: "Test Name",
            email: "test@example.com",
            body: "Test Body",
          },
        ],
        totalPages: 1,
      },
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Test Name")).toBeInTheDocument();
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/data/search", {
        params: { queryString: "", page: 1, limit: 10 },
      });
    });
  });

  test("displays loading spinner while fetching data", async () => {
    mockedAxios.get.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { data: [], totalPages: 1 } }), 500)
        )
    );

    render(<App />);
    expect(screen.getByRole("status")).toBeInTheDocument(); // Spinner
    await waitFor(() =>
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
    );
  });

  test("handles search input and fetches data", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: [], totalPages: 1 },
    });

    render(<App />);

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "query" } });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/data/search", {
        params: { queryString: "query", page: 1, limit: 10 },
      });
    });
  });

  test("handles pagination click", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            postId: 1,
            id: 1,
            name: "Test Name",
            email: "test@example.com",
            body: "Test Body",
          },
        ],
        totalPages: 2,
      },
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Test Name")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("2"));
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/data/search", {
        params: { queryString: "", page: 2, limit: 10 },
      });
    });
  });

  test("handles file upload correctly", async () => {
    const mockFile = new File(["content"], "test.csv", { type: "text/csv" });
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<App />);

    const fileInput = screen.getByLabelText("Upload CSV");
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const uploadButton = screen.getByText("Upload CSV");
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/data/upload",
        expect.any(FormData),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      expect(
        screen.getByText("CSV file uploaded successfully!")
      ).toBeInTheDocument();
    });
  });

  test("displays error when file upload fails", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Upload error"));

    render(<App />);

    const fileInput = screen.getByLabelText("Upload CSV");
    fireEvent.change(fileInput, {
      target: { files: [new File(["content"], "test.csv")] },
    });

    fireEvent.click(screen.getByText("Upload CSV"));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Error uploading CSV file")).toBeInTheDocument();
    });
  });
});
