require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const { Spreadsheet } = require('./src/api/google.api');
const { BitrixTasks } = require('./src/api/bitrix.api');
const { OzonService } = require('./src/services/ozon.service');

console.clear();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/api', async (req, res) => {
  try {
    const z = new OzonService(process.env.SPREADSHEET_TEST_2, 'Заявки');
    await z.init();
    // await z.rewriteOrderStatuses();
    // await z.rewriteTaskNumbers();
    
    res.json({
      success: true,
      data: [z.orderData],
    }).status(200);
  } catch (e) {
    res.json({ success: false, data: e.message }).status(400);
  }
});


module.exports = app;
