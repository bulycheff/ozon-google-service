const { google } = require('googleapis');
const path = require('path');

class GoogleApi {
  sheets = google.sheets({
    version: 'v4',
    client: 'auth',
  });
  
  async auth() {
    const auth = await new google.auth.GoogleAuth({
      // keyFile: 'src/api/google/keys.json',
      keyFile: 'src/api/keys.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
    return {
      api: this.sheets,
      auth,
    };
  }
  
}

class Spreadsheet extends GoogleApi {
  constructor(spreadsheetId) {
    super();
    this._spreadsheetId = spreadsheetId;
  }
  
  async read(sheetName, range = 'A1:AE') {
    const { auth, api } = await this.auth();
    const { data: { values } } = await api.spreadsheets.values.get({
      auth,
      spreadsheetId: this._spreadsheetId,
      range: `${sheetName}!${range}`,
    });
    return values;
  }
  
  async updateCell(sheetName, cellAddress, value) {
    const { auth, api } = await this.auth();
    
    await api.spreadsheets.values.update({
      auth,
      spreadsheetId: this._spreadsheetId,
      range: `${sheetName}!${cellAddress}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[value]],
      },
    });
  }
}

class SheetTable extends Spreadsheet {
  _spreadsheetId;
  _sheetName;
  _headers;
  _data;
  
  constructor(spreadsheetId, sheetName) {
    super(spreadsheetId);
    this._spreadsheetId = spreadsheetId;
    this._sheetName = sheetName;
  }
  
  async load(range = 'A:AE') {
    const values = await this.read(this._sheetName, range);
    this._data = [...values];
    this._headers = values.shift();
    return [...values];
  }
  
  async updateCell(cellAddress = 'A1', value = '') {
    const { auth, api } = await this.auth();
    
    await api.spreadsheets.values.update({
      auth,
      spreadsheetId: this.spreadsheetId,
      range: `${this._sheetName}!${cellAddress}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[value]],
      },
    });
  }
  
  async batchUpdate(data) {
    const { auth, api } = await this.auth();
    
    await api.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      auth,
      resource: {
        valueInputOption: 'USER_ENTERED',
        // data: [{range: "sheet1!A1", values: [["value"]]}]
        data: data,
      },
      
    });
  }
  
  get spreadsheetId() {
    return this._spreadsheetId;
  }
  
  get sheetName() {
    return this._sheetName;
  }
  
  get data() {
    return this._data;
  }
  
  set data(arr) {
    this._data = [...arr];
  }
  
  get headers() {
    return this._headers;
  }
  
}

module.exports = { Spreadsheet, SheetTable };
