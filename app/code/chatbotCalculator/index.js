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
        return this.evaluateExpression(prompt);
      }
      else {
        /** 
         * We will get Invalid expression if we dont mention operator before prompt.
         * example:- '+20', '-390', '-(2 * 100) - 10', '*((2 * 100) - 10)'.
         */
        const expression = `${previousResult}${prompt}`;
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
      // Evaluate the expression safely
      const result = Function(`'use strict'; return (${expression})`)();
      return result;
    } catch (error) {
      return 'Invalid expression';
    }
  }

  dependencies() {
    return [
      './chatbot/index.js',
    ];
  }
}

module.exports = new ChatbotCalculator();
