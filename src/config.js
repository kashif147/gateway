require("dotenv").config();

module.exports = {
  server: {
    port: process.env.PORT || 8080,
    nodeEnv: process.env.NODE_ENV || "development",
  },

  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["*"],
  },

  services: {
    user: process.env.USER_SERVICE_URL || "http://localhost:3500",
    subscription: "http://localhost:4400",
    config: process.env.CONFIG_SERVICE_URL || "http://localhost:3000",
    audit: process.env.AUDIT_SERVICE_URL || "http://localhost:5000",
    profile: process.env.PROFILE_SERVICE_URL || "http://localhost:5500",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Max requests per window
  },

  security: {
    jwtSecret: process.env.JWT_SECRET, // Secret key for JWT
    // jwtExpiry: process.env.JWT_EXPIRY || "900s", // JWT token expiry time
  },

  logging: {
    level: process.env.LOG_LEVEL || "info", // Logging level
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === "true", // Enable/disable request logging
  },

  healthCheck: {
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // Health check interval in milliseconds
  },

  proxy: {
    timeout: parseInt(process.env.PROXY_TIMEOUT) || 30000, // Request timeout
    timeoutMs: parseInt(process.env.PROXY_TIMEOUT_MS) || 30000, // Proxy timeout
  },

  retry: {
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY) || 1000,
  },
};
