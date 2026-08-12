const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  }
}

const required = ["RDS_HOST", "RDS_USER", "RDS_PASSWORD", "RDS_PORT", "RDS_DB"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

module.exports = {
  rds_host: process.env.RDS_HOST,
  rds_user: process.env.RDS_USER,
  rds_password: process.env.RDS_PASSWORD,
  rds_port: Number(process.env.RDS_PORT),
  rds_db: process.env.RDS_DB,
  server_host: process.env.SERVER_HOST || "localhost",
  server_port: Number(process.env.SERVER_PORT || 8081),
  google_client_id: process.env.GOOGLE_CLIENT_ID || "unused-google-client-id",
  google_client_secret:
    process.env.GOOGLE_CLIENT_SECRET || "unused-google-client-secret",
  google_callback_url:
    process.env.GOOGLE_CALLBACK_URL || "http://localhost:8081/api/google/callback",
  facebook_client_id: process.env.FACEBOOK_CLIENT_ID || "unused-facebook-client-id",
  facebook_client_secret:
    process.env.FACEBOOK_CLIENT_SECRET || "unused-facebook-client-secret",
  facebook_callback_url:
    process.env.FACEBOOK_CALLBACK_URL || "http://localhost:8081/api/facebook/callback",
};
