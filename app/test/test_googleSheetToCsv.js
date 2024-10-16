const test = require('ava');
const sinon = require('sinon');
let my = require('/mycode/googleSheetToCSV/index.js');

const mockGoogleApis = {
  sheets: () => ({
    spreadsheets: {
      values: {
        get: sinon.stub()
      }
    }
  })
};

test.beforeEach(() => {
  sinon.stub(google, 'sheets').returns(mockGoogleApis.sheets());
});

test.afterEach(() => {
  sinon.restore();
});

test('getGoogleSheetData should fetch data for a public sheet', async t => {
  const mockData = { values: [['Header1', 'Header2'], ['Row1Col1', 'Row1Col2']] };

  // Set up the get method to resolve with mock data
  mockGoogleApis.sheets().spreadsheets.values.get.resolves({ data: mockData });

  const data = await my.getGoogleSheetData('dummyApiKey', 'dummyId', 'Sheet1!A1:B2', false, '');
  t.deepEqual(data, mockData.values);
});

test('writeToCsv should write data to CSV', t => {
  const data = [['Header1', 'Header2'], ['Row1Col1', 'Row1Col2']];
  const csvFile = 'path/to/output.csv';

  // Set up the mock behavior for writeFileSync
  mockFs.writeFileSync.callsFake((filePath, content) => {
    // Simulate successful file write
    console.log(`**** Data successfully written to ${filePath}. *****`);
  });

  // Temporarily replace fs with the mock
  const originalFs = global.fs;
  global.fs = mockFs;

  const response = my.writeToCsv(data, csvFile);

  // Restore the original fs
  global.fs = originalFs;

  t.regex(response, /Data successfully written/);
});


test('writeToCsv should handle file write errors', t => {
  const data = [['Test']];
  const csvFile = '';
  // Setup the mock to throw an error
  mockFs.writeFileSync.throws(new Error("Error writing to :Error: ENOENT: no such file or directory, open ''"));

  const response = my.writeToCsv(data, csvFile);
  // t.regex(response, "Error writing to :Error: ENOENT: no such file or directory, open ''");
  t.is(response, "Error writing to :Error: ENOENT: no such file or directory, open ''");  
});

test('main should call getGoogleSheetData and writeToCsv', async t => {
  const mockData = [['Header1', 'Header2']];
  sinon.stub(my, 'getGoogleSheetData').resolves(mockData);
  sinon.stub(my, 'writeToCsv').returns('**** Data successfully written to output.csv. *****');

  const response = await my.main('dummyApiKey', 'dummyId', 'Sheet1!A1:B2', 'output.csv', false);

  t.true(my.getGoogleSheetData.calledOnce);
  t.true(my.writeToCsv.calledOnce);
  t.is(response, '**** Data successfully written to output.csv. *****');
});
