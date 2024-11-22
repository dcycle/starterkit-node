const test = require('ava');
const sinon = require('sinon');

let my = require('/mycode/webhookWhatsApp/index.js');

test('generateErrorXmlResponse should generate correct XML for a given error message', t => {
  const errorMessage = 'Something went wrong!';
  const result = my.generateErrorXmlResponse(errorMessage);

  // Expected XML structure
  const expectedXml = '<?xml version="1.0" encoding="UTF-8"?>' + '<Response>Something went wrong!</Response>';
  // Check if the result matches the expected XML
  t.is(result, expectedXml);
});

test('generateErrorXmlResponse should handle empty error message', t => {
  const errorMessage = '';
  const result = my.generateErrorXmlResponse(errorMessage);

  // Expected XML structure for empty error message
  const expectedXml = '<?xml version="1.0" encoding="UTF-8"?>' + '<Response></Response>';
  // Check if the result matches the expected XML
  t.is(result, expectedXml);
});

test('generateXmlResponse should generate correct XML for a given JSON message', t => {
  // A simple JSON-like string
  const jsonMessage = '{"key": "value"}';
  const result = my.generateXmlResponse(jsonMessage);

  // Expected XML structure
  const expectedXml = '<?xml version="1.0" encoding="UTF-8"?>' + '<Response>{"key": "value"}</Response>';
  // Check if the result matches the expected XML
  t.is(result, expectedXml);
});

test('generateXmlResponse should handle empty JSON message', t => {
  const jsonMessage = '';  // Empty string as the JSON message
  const result = my.generateXmlResponse(jsonMessage);

  // Expected XML structure for an empty message
  const expectedXml = '<?xml version="1.0" encoding="UTF-8"?>' + '<Response></Response>';

  t.is(result, expectedXml);  // Check if the result matches the expected XML
});

test('generateXmlResponse should handle special characters in the JSON message', t => {
  // Special characters in the JSON string
  const jsonMessage = '{"message": "This & that < these >"}';
  const result = my.generateXmlResponse(jsonMessage);

  // Expected XML structure with special characters preserved
  const expectedXml = '<?xml version="1.0" encoding="UTF-8"?>' + '<Response>{"message": "This & that < these >"}</Response>';
  // Check if the result matches the expected XML
  t.is(result, expectedXml);
});

test('generateXmlResponse should handle large JSON string gracefully', t => {
  // A very large string as JSON message
  const jsonMessage = '{"largeData": ' + '"'.repeat(10) + '}';
  const result = my.generateXmlResponse(jsonMessage);

  // Build the expected result dynamically
  const expectedXml = '<?xml version="1.0" encoding="UTF-8"?>' + `<Response>{"largeData": ${'"'.repeat(10)}}</Response>`;
  // Check if the result matches the expected XML
  t.is(result, expectedXml);
});
