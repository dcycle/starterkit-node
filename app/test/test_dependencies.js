const test = require('ava');
const sinon = require('sinon');

let my = require('/mycode/dependencies/index.js');

class DependencyTestHelper {
  static mockDependency(dependencies) {
    return new class {
      dependencies() {
        return dependencies;
      }
    }();
  }
}

test('Dependencies calculated correctly', t => {
  [
    {
      message: 'empty case',
      app: class {

      },
      in: [],
      expected: {
        errors: [],
        results: [],
      },
    },
    {
      message: 'base case',
      app: new class {
        component(name) {
          switch (name) {
            case 'a':
              return DependencyTestHelper.mockDependency(['b']);

            case 'b':
              return DependencyTestHelper.mockDependency([]);

            default:
              throw 'Unknown component ' + name;
          }
        }
      }(),
      in: ['a'],
      expected: {
        errors: [],
        results: ['b', 'a'],
      },
    },
    {
      message: 'circular case',
      app: new class {
        component(name) {
          switch (name) {
            case 'a':
              return DependencyTestHelper.mockDependency(['b']);

            case 'b':
              return DependencyTestHelper.mockDependency(['a']);

            default:
              throw 'Unknown component ' + name;
          }
        }
      }(),
      in: ['a'],
      expected: {
        errors: ['RangeError: Maximum call stack size exceeded'],
        results: ['a'],
      },
    },
    {
      message: 'non-explicit',
      app: new class {
        component(name) {
          switch (name) {
            case 'a':
              return DependencyTestHelper.mockDependency(['b']);

            case 'b':
              return DependencyTestHelper.mockDependency(['c']);

            case 'c':
              return DependencyTestHelper.mockDependency([]);

            default:
              throw 'Unknown component ' + name;
          }
        }
      }(),
      in: ['a'],
      expected: {
        errors: [],
        results: ['c', 'b', 'a'],
      },
    },
    {
      message: 'no dependencies',
      app: new class {
        component(name) {
          switch (name) {
            case 'a':
              return DependencyTestHelper.mockDependency([]);

            default:
              throw 'Unknown component ' + name;
          }
        }
      }(),
      in: ['a'],
      expected: {
        errors: [],
        results: ['a'],
      },
    },
    {
      message: 'no dependencies() method',
      app: new class {
        component(name) {
          switch (name) {
            case 'a':
              return {};

            default:
              throw 'Unknown component ' + name;
          }
        }
      }(),
      in: ['a'],
      expected: {
        errors: [],
        results: ['a'],
      },
    },
  ].forEach(function(data) {
    var output = my.getInOrder(data.in, data.app);

    if (JSON.stringify(output) != JSON.stringify(data.expected)) {
      console.log({
        output: output,
        expected: data.expected,
      });
    }

    t.true(JSON.stringify(output) == JSON.stringify(data.expected), data.message);
  });
});
