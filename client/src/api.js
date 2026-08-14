const config = require("./config.json");

const localBaseUrl = `http://${config.server_host}:${config.server_port}`;
const configuredBaseUrl = process.env.REACT_APP_API_BASE_URL;

export const API_BASE_URL = (
  configuredBaseUrl !== undefined
    ? configuredBaseUrl
    : process.env.NODE_ENV === "production"
      ? ""
      : localBaseUrl
).replace(/\/$/, "");

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
