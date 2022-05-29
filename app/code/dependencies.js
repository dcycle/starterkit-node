// @flow
/**
 *
 * You can test this by running:
 */

module.exports = new class {
  merge(arr1, arr2) {
    return [...new Set([...arr1 ,...arr2])];
  }

  getUnorderedRecursive(done, components, app, ret) {
    const that = this;
    components.forEach((elem, index) => {
      app.component(elem).dependencies().forEach((dependency) => {
        ret = that.placeDependency(dependency, [elem], [], ret);
        ret = that.placeDependency(elem, [], [dependency], ret);

        if (!components.includes(dependency)) {
          ret = that.getUnorderedRecursive(that.merge(done, components), [dependency], app, ret);
        }
      });
    });
    return ret;
  }

  getInOrder(
    components /*:: : array */,
    app /*:: : array */
  ) /*:: : array */ {
    let ret = {
      errors: [],
      detailedResults: {},
      results: [],
    };
    try {
      ret = this.getUnorderedRecursive([], components, app, ret);

      ret = this.orderResults(ret);
      ret.results = Object.keys(ret.detailedResults);
    }
    catch (err) {
      ret.results = this.merge(ret.results, components);
      ret.errors.push(err.message);
    }

    delete ret.detailedResults;

    return ret;
  }

  orderResults(ret) {
    let i = 0;
    do {
      if (++i > 300) {
        ret.errors.push('Could not determine dependencies in 300 cycles');
        break;
      }
      ret = this.reorderOne(ret);
    }
    while (!ret.reorderDone);

    delete ret.reorderDone;
    return ret;
  }

  reorderOne(ret) {
    ret.reorderDone = false;
    let breakMe = false;
    const that = this;

    Object.keys(ret.detailedResults).forEach((elem) => {
      ret.detailedResults[elem].weAreBefore.forEach((after) => {
        ret = that.reorder(elem, after, breakMe, ret);
        breakMe = ret.breakMe;
        delete ret.breakMe;
      });
      ret.detailedResults[elem].weAreAfter.forEach((before) => {
        ret = that.reorder(before, elem, breakMe, ret);
        breakMe = ret.breakMe;
        delete ret.breakMe;
      });
    });

    if (!breakMe) {
      ret.reorderDone = true;
    }

    return ret;
  }

  removeFrom(arr, item) {
    const index = arr.indexOf(item);
    return this.merge(arr.slice(0, item), arr.slice(item + 1));
  }

  reorder(before, after, breakMe, ret) {
    ret.breakMe = true;

    if (breakMe) {
      return ret;
    }

    const keys = Object.keys(ret.detailedResults);

    if (keys.indexOf(before) < keys.indexOf(after)) {
      ret.breakMe = false;
      return ret;
    }

    const beforeObj = ret.detailedResults[before];
    delete ret.detailedResults[before];

    ret.detailedResults = {
      ...{
        [before]: beforeObj,
      },
      ...ret.detailedResults,
    };

    return ret;
  }

  placeDependency(
    elem /*:: : string */,
    weAreBefore /*:: : array */,
    weAreAfter /*:: : array */,
    ret /*:: : object */
  ) /*:: : object */ {
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

}();
