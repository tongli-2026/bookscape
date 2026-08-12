const config = require("./config.json");

const fallbackBaseUrl = `http://${config.server_host}:${config.server_port}`;

export const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || fallbackBaseUrl
).replace(/\/$/, "");

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
