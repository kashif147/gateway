const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const config = require("./src/config");
const verifyToken = require("./middleware/auth.mw");

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Service routes configuration
const routes = {
  // Public Routes (No Auth Required)
  "/auth": {
    target: config.services.user,
    pathRewrite: { "^/api/v1/auth": "/api/v1/auth" },
    auth: false,
  },
  "/api/v1/microsoft": {
    target: config.services.user,
    pathRewrite: { "^/api/v1/microsoft": "/api/v1/microsoft" },
    auth: false,
  },

  // Protected Routes (Auth Required)
  "/api/v1/users": {
    target: config.services.user,
    pathRewrite: { "^/api/v1/users": "/api/v1/users" },
    auth: true,
  },
  "/api/config": {
    target: config.services.config,
    pathRewrite: { "^/api/config": "/api" },
    auth: true,
  },
  "/api/audit": {
    target: config.services.audit,
    pathRewrite: { "^/api/audit": "/api" },
    auth: true,
  },
  "/subscription-service/api/v1/testing": {
    target: config.services.subscription,
    pathRewrite: { "^/subscription-service": "" },
    auth: false,
  },
  "/subscription-service": {
    target: config.services.subscription,
    pathRewrite: { "^/subscription-service": "" },
    auth: true,
  },
};

Object.entries(routes).forEach(([path, config]) => {
  const middleware = [
    ...(config.auth ? [verifyToken] : []),
    createProxyMiddleware({
      target: config.target,
      changeOrigin: true,
      pathRewrite: config.pathRewrite,
      onProxyReq: (proxyReq, req) => {
        console.log(`Proxying to ${config.target}: ${req.method} ${req.originalUrl}`);

        Object.keys(req.headers).forEach((key) => {
          proxyReq.setHeader(key, req.headers[key]);
        });

        if (req.user) {
          proxyReq.setHeader("X-User-Email", req.user.userEmail);
          proxyReq.setHeader("X-User-ID", req.user.id);
        }
      },
      onError: (err, req, res) => {
        console.error(`Proxy Error: ${err.message}`);
        res.status(500).json({
          error: "Service temporarily unavailable",
          message: err.message,
        });
      },
    }),
  ];

  app.use(path, ...middleware);
});

app.use((err, req, res, next) => {
  console.error("Gateway Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log("Available routes:");
  Object.entries(routes).forEach(([route, config]) => {
    console.log(`- ${route} -> ${config.target} (${config.auth ? "Protected" : "Public"})`);
  });
});
