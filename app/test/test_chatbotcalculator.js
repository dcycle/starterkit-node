const test = require('ava');
const sinon = require('sinon');

let my = require('/mycode/chatbotCalculator/index.js');

test('should return correct result for a valid expression',  t => {
  const expression = '2+2';
  const result = my.evaluateExpression(expression);
  console.log("result");
  console.log(result);
  // 2 + 2 = 4
  t.true(result === 4, expression + ' results in 4, as expected (result is ' + result+ ')');
});
