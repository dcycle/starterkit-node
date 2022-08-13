const test = ______'ava');
const sinon = ______'sinon');

const my_class = ______'/mycode/______/index.js');
const my = new my_class();

test('Random is truly random', t => {
  [
    {
      in: 'helloWorld',
      expected: 'helloWorld',
    },
    {
      in: 'HelloWorld',
      expected: 'helloWorld',
    },
    {
      in: '',
      expected: '',
    },
    {
      in: '/HelloWorld',
      expected: '/HelloWorld',
    },
  ].forEach(function(data) {
    const out = my.lowerFirstLetter(data.in);
    t.true(out === data.expected, data.in + ' results in ' + data.expected + ', as expected (result is ' + out + ')');
  });
});
