const request = require("supertest");
const connection = require("../db/connection");
const app = require("../server");

jest.mock("../db/connection", () => ({
  query: jest.fn(),
}));

beforeEach(() => {
  connection.query.mockReset();
});

test("GET /api/books/count returns the books count", async () => {
  connection.query.mockImplementation((_query, callback) => {
    callback(null, { rows: [{ count: 123 }] });
  });

  const response = await request(app).get("/api/books/count");

  expect(response.status).toBe(200);
  expect(response.body).toEqual([{ count: 123 }]);
  expect(connection.query).toHaveBeenCalledTimes(1);
});

test("GET /ebooks/:book_id/full_text returns full text when available", async () => {
  connection.query.mockImplementation((_query, _params, callback) => {
    callback(null, { rows: [{ full_text: "Once upon a time" }] });
  });

  const response = await request(app).get("/ebooks/11429013/full_text");

  expect(response.status).toBe(200);
  expect(response.body).toEqual({ full_text: "Once upon a time" });
  expect(connection.query).toHaveBeenCalledWith(
    expect.stringContaining("WHERE book_id = $1"),
    ["11429013"],
    expect.any(Function)
  );
});
