require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 4567;

app.listen(PORT, () => {
  console.log(`App started on PORT:${PORT}.`);
});
