// @flow
/**
 *
 * You can test this by running:
 */

class Dependencies {
  merge(arr1, arr2) {
    return [...new Set([...arr1 ,...arr2])];
  }

  getUnorderedRecursive(done, ______s, app, ret) {
    const that = this;
    ______s.forEach((elem, index) => {
      ret = that.placeDependency(elem, [], [], ret);
      if (typeof app.______(elem).dependencies === 'function') {
        app.______(elem).dependencies().forEach((dependency) => {
          ret = that.placeDependency(dependency, [elem], [], ret);
          ret = that.placeDependency(elem, [], [dependency], ret);

          if (!______s.includes(dependency)) {
            ret = that.getUnorderedRecursive(that.merge(done, ______s), [dependency], app, ret);
          }
        });
      }
    });
    return ret;
  }

  getInOrder(
    ______s,
    app
  ) {
    let ret = {
      errors: [],
      detailedResults: {},
      results: [],
    };
    try {
      ret = this.getUnorderedRecursive([], ______s, app, ret);

      ret = this.orderResults(ret);
      ret.results = Object.keys(ret.detailedResults);
    }
    catch (err) {
      ret.results = this.merge(ret.results, ______s);
      ret.errors.push(err.message);
    }

    return {
      errors: ret.errors,
      results: ret.results,
    };
  }

  orderResults(ret) {
    let i = 0;
    let res = {
      ret: ret,
      reorderDone: false,
    };

    do {
      if (++i > 300) {
        res.ret.errors.push('Could not determine dependencies in 300 cycles');
        break;
      }
      res = this.reorderOne(ret);
    }
    while (!res.reorderDone);

    return res.ret;
  }

  reorderOne(ret) {
    let res2 = {
      ret: ret,
      reorderDone: false,
    };
    let breakMe = false;
    const that = this;

    Object.keys(res2.ret.detailedResults).forEach((elem) => {
      res2.ret.detailedResults[elem].weAreBefore.forEach((after) => {
        const res = that.reorder(elem, after, breakMe, ret);
        res2.ret = res.ret;
        breakMe = res.breakMe;
      });
      res2.ret.detailedResults[elem].weAreAfter.forEach((before) => {
        const res = that.reorder(before, elem, breakMe, ret);
        res2.ret = res.ret;
        breakMe = res.breakMe;
      });
    });

    if (!breakMe) {
      res2.reorderDone = true;
    }

    return res2;
  }

  removeFrom(arr, item) {
    const index = arr.indexOf(item);
    return this.merge(arr.slice(0, item), arr.slice(item + 1));
  }

  reorder(before, after, breakMe, ret) {
    if (breakMe) {
      return {
        ret: ret,
        breakMe: true,
      };
    }

    const keys = Object.keys(ret.detailedResults);

    if (keys.indexOf(before) < keys.indexOf(after)) {
      return {
        ret: ret,
        breakMe: false,
      };
    }

    const beforeObj = ret.detailedResults[before];
    delete ret.detailedResults[before];

    ret.detailedResults = {
      ...{
        [before]: beforeObj,
      },
      ...ret.detailedResults,
    };

    return {
      ret: ret,
      breakMe: true,
    };
  }

  placeDependency(
    elem /*:: : string */,
    weAreBefore,
    weAreAfter,
    ret /*:: : Object */
  ) /*:: : Object */ {
    let ret2 = ret;

    if (typeof ret2.detailedResults[elem] === 'undefined') {
      ret2.detailedResults[elem] = {
        weAreAfter: [],
        weAreBefore: [],
      };
    }

    ret2.detailedResults[elem].weAreAfter = [...new Set([...ret2.detailedResults[elem].weAreAfter ,...weAreAfter])];

    ret2.detailedResults[elem].weAreBefore = [...new Set([...ret2.detailedResults[elem].weAreBefore ,...weAreBefore])];

    return ret2;
  }

}

// $FlowExpectedError
module.exports = new Dependencies();
