const test = require('ava');
const sinon = require('sinon');

let my = require('/mycode/crypto/index.js');

test('Random is truly random', t => {
  [
    {
      size: 32,
      same: false,
    },
    {
      size: 256,
      same: false,
    },
    {
      size: 0,
      same: true,
    },
    {
      size: -20,
      same: true,
    },
  ].forEach(function(data) {
    const a = my.random(data.size);
    const b = my.random(data.size);
    t.true(data.same ? a === b : a !== b, data.same ? 'same' : 'different' + ' as expected with a size of ' + data.size);
  });
});

// Start by stubbing the Math.random() function for more controlled testing
test('randomDigits generates a string of the correct length', (t) => {
  const length = 6;
  const result = my.randomDigits(length);

  // Test that the result is a string and has the correct length
  t.is(result.length, length, `Generated string should have length of ${length}`);
  t.is(typeof result, 'string', 'Generated value should be a string');
});

test('randomDigits generates only digits', (t) => {
  const length = 10;
  const result = my.randomDigits(length);

  // Test that all characters in the result string are digits
  const allDigits = /^[0-9]+$/.test(result);
  t.true(allDigits, 'Generated string should only contain digits (0-9)');
});

test('randomDigits handles edge case of length 1', (t) => {
  const length = 1;
  const result = my.randomDigits(length);

  // Test that the result is a single digit string
  t.is(result.length, 1, 'Generated string should have a length of 1');
  t.is(typeof result, 'string', 'Generated value should be a string');
  t.true(/^[0-9]$/.test(result), 'Generated string should be a single digit');
});

test('randomDigits handles very large lengths', (t) => {
  const length = 1000;  // A large length
  const result = my.randomDigits(length);

  // Test that the result is the correct length
  t.is(result.length, length, `Generated string should have length of ${length}`);
  t.is(typeof result, 'string', 'Generated value should be a string');
  t.true(/^\d+$/.test(result), 'Generated string should only contain digits');
});
