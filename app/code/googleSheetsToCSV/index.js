/**
 * Fetch data from Google Sheets (public or private) and write it to a CSV file.
 */
class GoogleSheetToCsv extends require('../component/index.js') {

  async getGoogleSheetData(apiKey, spreadsheetId, rangeName, isPrivate, serviceAccountFile) {
    try {
      let finalValues;
      const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
      if (isPrivate) {
        const auth = new google.auth.GoogleAuth({
          keyFile: serviceAccountFile,
          scopes: SCOPES,
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: rangeName,
        });
        finalValues = response.data.values || [];
      } else {
        // @ts-expect-error
        const { google } = require('googleapis');
        const sheets = google.sheets({ version: 'v4', auth: apiKey });
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: rangeName,
          key: apiKey,
        });
        finalValues = response.data.values || [];
      }

      return finalValues;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }

  writeToCsv(data, csvFile) {
    try {
      // @ts-expect-error
      const fs = require('fs');
      // @ts-expect-error
      fs.mkdirSync(require('path').dirname(csvFile), { recursive: true });
      const csvContent = data.map(row => row.join(',')).join('\n');
      fs.writeFileSync(csvFile, csvContent, 'utf-8');
      console.log(`**** Data successfully written to ${csvFile}. *****`);
    } catch (error) {
      console.error(`Error writing to ${csvFile}:`, error);
    }
  }

  async main(apiKeyOrServiceAccountFile, spreadsheetId, sheetId, csvFile, isPrivate) {
    const data = await this.getGoogleSheetData(
      apiKeyOrServiceAccountFile,
      spreadsheetId,
      sheetId,
      isPrivate,
      isPrivate ? apiKeyOrServiceAccountFile : null
    );

    if (data) {
      this.writeToCsv(data, csvFile);
    } else {
      console.error('Failed to retrieve data from Google Sheet.');
    }
  }

  async init(app)  {
    super.init(app);
    return this;
  }
}

module.exports = new GoogleSheetToCsv();
