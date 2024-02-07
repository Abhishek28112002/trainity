const { google } = require("googleapis");
const credentials = require('../keys/trainity-master-sheet-732cdb666cbc.json');
class Sheets {
  constructor() {
    this.SCOPE = ["https://www.googleapis.com/auth/spreadsheets"];
    this.sheets = google.sheets("v4");
    this.apikey = credentials;
  }

  async googleAuth() {
    this.auth = new google.auth.GoogleAuth({
      credentials: this.apikey,
      scopes: this.SCOPE,
    });
    this.token = await this.auth.getClient();
    return this.token;
  };

  async writeRow({ spreadsheetId, auth, sheetName, values }) {
    try {
      this.writeRowResult = this.sheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: sheetName,
        valueInputOption: "RAW",
        resource: {
          values: values,
        },
      });
      return this.writeRowResult;
    } catch (err) {
      throw err;
    }
  }
  async readRow({ spreadsheetId, sheetName,auth }) {
    try{
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      auth,
      range: sheetName,
    });

    const data = response.data.values.slice(1); // Skip the header row
   
return data;
  }
  catch (err) {
    throw err;
  }
  }

}

module.exports = Sheets;
