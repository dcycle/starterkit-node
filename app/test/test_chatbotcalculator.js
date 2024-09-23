const test = require('ava');
const sinon = require('sinon');

let my = require('/mycode/chatbotCalculator/index.js');

test('should return correct result for a valid expression',  t => {
  const expression = '2+2';
  const result = chatbot.evaluateExpression(expression);
  // 2 + 2 = 4
  expect(result).toBe(4);
  t.true(result === 4, expression + ' results in 4, as expected (result is ' + result+ ')');
});

test('should return correct result for a valid expression-1', t => {
  const expression = '(2 * 100) - 10';
  const result = chatbot.evaluateExpression(expression);
  // (2 * 100) - 10 = 190
  t.true(result === 190, expression + ' results in 190, as expected (result is ' + result+ ')');
});

test('should return correct result for a valid expression-2', t => {
  const expression = '+2';
  const result = chatbot.evaluateExpression(expression);
  // +2 = 2
  t.true(result === 2, expression + ' results in 2, as expected (result is ' + result+ ')');
});

test('should return correct result for a simple addition', t => {
  const expression = '190 + 100';
  const result = chatbot.evaluateExpression(expression);
  // 190 + 100 = 290
  t.true(result === 290, expression + ' results in 290, as expected (result is ' + result+ ')');
});

test('should return correct result for a complex expression', t => {
  const expression = '100 + (50 * 2) - 30';
  const result = my.evaluateExpression(expression);
  // 100 + 100 - 30 = 170
  t.true(result === 170, expression + ' results in 170, as expected (result is ' + result+ ')');
});

test('should return "Invalid expression" for an invalid expression', t => {
  const expression = '2 +';
  const result = my.evaluateExpression(expression);
  // Should catch invalid expression
  t.true(result === 'Invalid expression', expression + ' results in "Invalid expression", as expected (result is ' + result+ ')');
});

test('should return "Invalid expression" for a non-numeric expression', () => {
  const expression = 'foo + 100';
  const result = my.evaluateExpression(expression);
  // Should catch non-numeric expression
  t.true(result === 'Invalid expression', expression + ' results in "Invalid expression", as expected (result is ' + result+ ')');
});

test('should return correct result for a valid expression with previous value', t => {
  const previousValue = '190';
  const prompt = '+(2 * 100) - 10';
  const expression = `${previousValue} ${prompt}`;
  const result = my.evaluateExpression(expression);
  // 190 + (200 - 10) = 390
  t.true(result === 'Invalid expression', expression + ' results in 390, as expected (result is ' + result+ ')');
});
