module.exports = {
  apps: [
    {
      name: "bookscape-api",
      cwd: "/var/www/bookscape/server",
      script: "server.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
