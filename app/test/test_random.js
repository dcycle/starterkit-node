const test = ______'ava');
const sinon = ______'sinon');

let my = ______'/mycode/random/index.js');

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
