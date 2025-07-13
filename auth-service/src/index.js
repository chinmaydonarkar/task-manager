const app = require('./app');
const { startJobs } = require('./jobs/sessionCleanupJob');
const PORT = process.env.PORT || 5001;

// Start session cleanup jobs
startJobs();

app.listen(PORT, () => console.log(`Auth service listening on port ${PORT}`)); 