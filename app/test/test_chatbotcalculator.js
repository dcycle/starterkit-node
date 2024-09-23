const test = require('ava');
const sinon = require('sinon');
const { expect } = require('chai');

let my = require('/mycode/chatbotCalculator/index.js');

test('should return correct result for a valid expression', () => {
  const expression = '2+2';
  const result = chatbot.evaluateExpression(expression);
  // 200 - 10 = 190
  expect(result).toBe(4);
});

test('should return correct result for a valid expression-1', () => {
  const expression = '(2 * 100) - 10';
  const result = chatbot.evaluateExpression(expression);
  // 200 - 10 = 190
  expect(result).toBe(190);
});

test('should return correct result for a valid expression-2', () => {
  const expression = '+2';
  const result = chatbot.evaluateExpression(expression);
  // 200 - 10 = 190
  expect(result).toBe(2);
});

test('should return correct result for a simple addition', () => {
  const expression = '190 + 100';
  const result = chatbot.evaluateExpression(expression);
  // 190 + 100 = 290
  expect(result).toBe(290);
});

test('should return correct result for a complex expression', () => {
  const expression = '100 + (50 * 2) - 30';
  const result = my.evaluateExpression(expression);
  // 100 + 100 - 30 = 170
  expect(result).toBe(170); 
});

test('should return "Invalid expression" for an invalid expression', () => {
  const expression = '2 +';
  const result = my.evaluateExpression(expression);
  // Should catch invalid expression
  expect(result).toBe('Invalid expression');
});

test('should return "Invalid expression" for a non-numeric expression', () => {
  const expression = 'foo + 100';
  const result = my.evaluateExpression(expression);
  // Should catch non-numeric expression
  expect(result).toBe('Invalid expression');
});

test('should return correct result for a valid expression with previous value', () => {
  const previousValue = '190';
  const prompt = '+(2 * 100) - 10';
  const expression = `${previousValue} ${prompt}`;
  const result = my.evaluateExpression(expression);
  // 190 + (200 - 10) = 390
  expect(result).toBe(390);
});
