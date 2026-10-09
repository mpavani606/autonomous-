const { PORT } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

const startServer = async () => {
  await connectDB();
  return app.listen(PORT, () => {
    console.log(`Autonomous Study Planner server running on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start the Autonomous Study Planner server.', error);
    process.exitCode = 1;
  });
}

module.exports = app;
