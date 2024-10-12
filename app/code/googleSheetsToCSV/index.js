/**
 * Fetch data from Google Sheets (public or private) and write it to a CSV file.
 */
class GoogleSheetToCsv extends require('../component/index.js') {

  /**
   * Retrieves data from a Google Sheet.
   * 
   * @param {string} apiKey - The API key for public access (if isPrivate is false).
   * @param {string} spreadsheetId - The ID of the Google Spreadsheet.
   * @param {string} rangeName - The range of cells to fetch (e.g., 'Sheet1!A1:C10').
   * @param {boolean} isPrivate - Indicates if the sheet is private or public.
   * @param {string} serviceAccountFile - The path to the service account JSON file (if isPrivate is true).
   * @returns {Promise<Array<Array<string>> | null>} - Returns the values from the sheet or null on error.
   */  
  async getGoogleSheetData(apiKey, spreadsheetId, rangeName, isPrivate, serviceAccountFile) {
    try {
      let finalValues;
      const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
      // Load the Google APIs client library      
      // @ts-expect-error
      const { google } = require('googleapis');
      if (isPrivate) {
        // If the sheet is private, authenticate using a service account        
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
        // For public sheets, use the API key        
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

  /**
   * Writes the provided data to a CSV file.
   * 
   * @param {Array<Array<string>>} data - The data to write to the CSV file.
   * @param {string} csvFile - The path to the CSV file to write.
   * @returns {string} - Success or error message.
   */  
  writeToCsv(data, csvFile) {
    let response = "";
    try {
      // @ts-expect-error
      const fs = require('fs');
      // Create the directory for the CSV file if it doesn't exist      
      // @ts-expect-error
      fs.mkdirSync(require('path').dirname(csvFile), { recursive: true });
      // Convert the data to CSV format      
      const csvContent = data.map(row => row.join(',')).join('\n');
      // Write the CSV content to the file      
      fs.writeFileSync(csvFile, csvContent, 'utf-8');
      response = `**** Data successfully written to ${csvFile}. *****`;
      console.log(response);
      return response;
    } catch (error) {
      response = `Error writing to ${csvFile}:` + error;
      console.error(response);
      return response;
    }
  }

  /**
   * Main method to orchestrate data fetching and CSV writing.
   * 
   * @param {string} apiKeyOrServiceAccountFile - API key or service account file path.
   * @param {string} spreadsheetId - The ID of the Google Spreadsheet.
   * @param {string} sheetId - The sheet Id.
   * @param {string} csvFile - The path to the output CSV file.
   * @param {boolean} isPrivate - Indicates if the sheet is private or public.
   * Private is true. Public is "".
   * @returns {Promise<string>} - Result message indicating success or failure.
   */  
  async main(apiKeyOrServiceAccountFile, spreadsheetId, sheetId, csvFile, isPrivate) {
    const data = await this.getGoogleSheetData(
      apiKeyOrServiceAccountFile,
      spreadsheetId,
      sheetId,
      isPrivate,
      isPrivate ? apiKeyOrServiceAccountFile : null
    );
    if (data) {
      return this.writeToCsv(data, csvFile);
    } else {
      const response = 'Failed to retrieve data from Google Sheet.';
      console.error(response);
      return response;
    }
  }

  /**
   * Initializes the component with the application instance.
   * 
   * @param {Object} app - The application instance.
   * @returns {Promise<GoogleSheetToCsv>} - The initialized component instance.
   */
  async init(app)  {
    super.init(app);
    return this;
  }
}

module.exports = new GoogleSheetToCsv();
