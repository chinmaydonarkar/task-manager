const app = require('./app');
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Gateway listening on port ${PORT}`)); 