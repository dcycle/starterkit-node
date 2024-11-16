/**
 * Manage Google Sheets (public or private).
 */
class GoogleSheetManage extends require('../component/index.js') {

  async authenticate() {
    // Load the Google APIs client library      
    // @ts-expect-error
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      keyFile: '/output/sensitive-data/celtic-fact-438015-c0-3e39679e41cc.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    return sheets;
  }

  // Update a cell in the Google Sheet
  async updateCell() {
    const sheets = await authenticate();
    const RANGE = 'Sheet1!A1';  // The range you want to update
    const SPREADSHEET_ID = '108aKEJNfy5UGdBYZydE8we5hOtUMuombuZyp0CdQLso';
    const request = {
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',  // or 'USER_ENTERED' depending on your use case
      resource: {
        values: [
          ['Updated Value'],  // The new value you want to set
        ],
      },
    };

    try {
      const response = await sheets.spreadsheets.values.update(request);
      console.log('Cell updated:', response.data);
    } catch (error) {
      console.error('Error updating cell:', error);
    }
  }

  /**
   * Initializes the component with the application instance.
   * 
   * @param {Object} app - The application instance.
   * @returns {Promise<this>} - The initialized component instance.
   */
  async init(app)  {
    super.init(app);
    return this;
  }
}

module.exports = new GoogleSheetManage();
