let app;
try {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  app = require("../dist/app").default;
} catch (error) {
  module.exports = (req, res) => {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        message: "Failed to load Express app",
        error: error && error.message ? error.message : String(error),
        stack: error && error.stack ? error.stack : null,
        cwd: process.cwd(),
        dirname: __dirname,
      }),
    );
  };
}

if (app) {
  module.exports = app;
}
