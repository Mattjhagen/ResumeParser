// middleware/logger.js
export default function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const log = {
      level: "info",
      event: "http_request",
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      response_time_ms: duration
    };

    console.log(JSON.stringify(log));
  });

  next();
}
