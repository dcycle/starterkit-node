// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * ChatbotCalculator functionality.
 */
class ChatbotCalculator extends require('../component/index.js') {
  /**
   * Method accepts user prompt and previous calculated result.
   * Does calculation based on user prompt.
   *
   * @param {string} prompt
   *   '2+2' or '+5' or '-1000'.....  
   * @param {string} previousResult 
   *   0 for the first time, else previous calculated value.
   *
   * @returns number
   */
  async calculate(prompt, previousResult) {
    try {
      if (!previousResult) {
        console.log("----Before previos result ----------");
        console.log(prompt);
        return this.evaluateExpression(prompt);
      }
      else {
        /** 
         * We will get Invalid expression if we dont mention operator before prompt for consecutive conversations requests.
         * example:- '+20', '-390', '-(2 * 100) - 10', '*((2 * 100) - 10)'.
         */
        const expression = `${previousResult}${prompt}`;
        console.log("----expression--------");
        console.log(expression);
        return this.evaluateExpression(expression);
      }
    } catch (error) {
      return 'Invalid expression';
    }
  }

  /**
   * Evaluates a mathematical expression safely.
   * 
   * This method takes a string expression, evaluates it, and returns the result.
   * It uses the `Function` constructor to safely evaluate the expression in strict mode.
   * If the expression is invalid, it catches the error and returns a descriptive message.
   *
   * @param {string} expression - The mathematical expression to evaluate.
   * @returns {number|string} The result of the evaluation, or 'Invalid expression' if an error occurs.
   */
  evaluateExpression(expression) {
    try {
      // @ts-ignore
      const { create, all } = require('mathjs');
      // Create a mathjs instance
      const math = create(all);
      // Use math.js to evaluate the expression safely
      console.log("before math evaluate");
      console.log(expression);
      const result = math.evaluate(expression);
      console.log("after math evaluate");
      console.log(result);
      return result;
    } catch (error) {
      // Log the error for debugging
      console.error(error);      
      return 'Invalid expression';
    }
  }

  dependencies() {
    return [
      './chatbot/index.js',
      'mathjs'
    ];
  }
}

module.exports = new ChatbotCalculator();
