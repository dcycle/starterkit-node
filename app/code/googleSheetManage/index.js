/**
 * Manage Google Sheets.
 *
 * Insert Rows or Column, update data in google sheet.
 *
 * User must have edit permission to insert update data particular google sheeet.
 */
class GoogleSheetManage extends require('../component/index.js') {

  /**
   * Authenticate Google Services to get particular sheet.
   *
   * @param {string} serviceAccountFile - Service account file path to authenticate google cloud.
   *
   * @returns {Promise<string>} - Returns google sheet.
   */
  async authenticate(serviceAccountFile) {
    // Load the Google APIs client library.
    // @ts-expect-error
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    return sheets;
  }

  /**
   * Update a cell in the Google Sheet.
   *
   * @param {string} serviceAccountFile - Service account file path.
   * @param {string} spreadsheetId - The ID of the Google Spreadsheet.
   * @param {string} range - Sheet and the range you want to update . ex:- 'Sheet1!A1'
   * @param {string} values - Values to update. values which is an array of rows,
   * where each row is an array of values.
   *
   * @returns {Promise<bool>} - Result indicating true or false.
   */
  async updateCell(serviceAccountFile, spreadsheetId, range, values) {
    try {
      const sheets = await this.authenticate(serviceAccountFile);
      const request = {
        spreadsheetId: spreadsheetId,
        range: range,
        // RAW: The values are inserted as-is.
        // USER_ENTERED: Google Sheets will treat the values as if they were
        // entered by a user. If you provide a number, it will be treated as a number.
        // If you provide a string with a formula (like =SUM(A1:A10)), it will be interpreted
        // as a formula.
        valueInputOption: 'RAW',
        resource: {
          values: [
            // The new value you want to set.
            values,
          ],
        },
      };
      const response = await sheets.spreadsheets.values.update(request);
      if (response.data) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating cell:', error);
    }
  }

  /**
   * Inserting rows
   *
   * @param {string} serviceAccountFile - Service account file path.
   * @param {string} spreadsheetId - The ID of the Google Spreadsheet.
   * @param {string} sheetId - The Sheet Id which needs to be updated.
   * @param {string} dimension - insert 'ROWS' or 'COLUMNS'
   * @param {string} afterOrBefore - insert 'After' Or 'Before'
   * @param {int} startIndex - Starting Index.
   * @param {int} numOfRowColumn - Number of Rows or Columns to insert.
   *
   * @returns {Promise<bool>} - Result indicating true or false.
   */
  async insertRowsColumns(
    serviceAccountFile,
    spreadsheetId,
    sheetId,
    dimension,
    afterOrBefore,
    startIndex = 'After',
    numOfRowsColumns) {
    try {
      const sheets = await this.authenticate(serviceAccountFile);
      if (afterOrBefore == 'Before') {
        // Row before which to insert (Row 9 means starting row 8 in 0-based index)
        startIndex = startIndex - 1;
      }
      let endIndex = startIndex + numOfRowsColumns;
      const request = {
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [
            {
              insertDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: dimension,
                  startIndex: startIndex,
                  endIndex: endIndex,
                },
                // Whether to inherit formatting, set to true if needed
                inheritFromBefore: false,
              },
            },
          ],
        },
      };
      const response = await sheets.spreadsheets.batchUpdate(request);
      if (response.data) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error inserting rows:', error);
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
