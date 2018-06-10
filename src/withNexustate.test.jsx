import React, { Component } from "react";
import { mount, configure } from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import withNexustate from "./withNexustate";

configure({ adapter: new Adapter() });

class TestClass extends Component {
  constructor(props) {
    super(props);

    if (props.listenFor) {
      props.listenFor.forEach(params => props.nexus.listen(params));
    }
  }
  render() {
    return (
      <div>Nothing</div>
    );
  }
}
global.localStorage = { setItem: () => {}, getItem: () => '{}' };
const WrappedTestClass = withNexustate(TestClass);

describe("withNexustate", () => {
  let props;
  let mountedTestClass;
  const mountTestClass = (listenFor) => {
    if (!mountedTestClass) {
      mountedTestClass = mount(
        <WrappedTestClass listenFor={listenFor} />
      );
    }
    return mountedTestClass;
  }

  beforeEach(() => {
    mountedTestClass = undefined;
  });

  it("plain renders", () => {
    const testClass = mountTestClass();
    const divs = testClass.find("div");
    expect(divs.length).toBeGreaterThan(0);
  });

  it("gets empty data object", () => {
    const parent = mountTestClass([{ key: 'test', initialLoad: true }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(testClass.props().data).toEqual({ test: undefined });
  });
  it("fills data and receives updates", () => {
    const parent = mountTestClass([{ key: 'test2', initialLoad: true }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(testClass.props().data).toEqual({ test2: undefined });
    testClass.props().nexus.setKey('test2', 'hello');
    parent.update();
    expect(testClass.props().data).toEqual({ test2: 'hello' });
  });
  it("fills data and receives updates with aliases", () => {
    const parent = mountTestClass([{ key: 'test3', initialLoad: true, alias: 'bumpkiss' }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(testClass.props().data).toEqual({ bumpkiss: undefined });
    testClass.props().nexus.setKey('test3', 'hello');
    parent.update();
    expect(testClass.props().data).toEqual({ bumpkiss: 'hello' });
  });
  it("fills data and receives updates with transforms", () => {
    const parent = mountTestClass([{ key: 'test4', initialLoad: true, transform: item => item ? item + '_transformed' : item }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(testClass.props().data).toEqual({ test4: undefined });
    testClass.props().nexus.setKey('test4', 'hello');
    parent.update();
    expect(testClass.props().data).toEqual({ test4: 'hello_transformed' });
  });
  it("receives updates from child updates", () => {
    const parent = mountTestClass([{ key: 'test5', initialLoad: true }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(testClass.props().data).toEqual({ test5: undefined });
    testClass.props().nexus.setKey(['test5', 'a', 'b', 'c'], 'hello');
    parent.update();
    expect(testClass.props().data).toEqual({ test5: { a: { b: { c: 'hello' } } } });
  });
  it("receives updates from two segments", () => {
    const parent = mountTestClass([{ segment: 'a', key: 'test6', initialLoad: true }, { segment: 'b', key: 'test6', initialLoad: true, alias: 'test7' }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(testClass.props().data).toEqual({ test6: undefined, test7: undefined });
    testClass.props().nexus.setKey('test6', 'hello', { segment: 'b' });
    testClass.props().nexus.setKey('test6', 'silly', { segment: 'a' });
    parent.update();
    expect(testClass.props().data).toEqual({ test6: 'silly', test7: 'hello' });
  });
  it("does not load initially if flag is unset", () => {
    const parent = mountTestClass([{ key: 'test8', initialLoad: false }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(testClass.props().data).toEqual({ });
    testClass.props().nexus.setKey('test8', 'hello');
    parent.update();
    expect(testClass.props().data).toEqual({ test8: 'hello' });
  });
  it("listens for everything is key is null", () => {
    const parent = mountTestClass([{ segment: 'test9', key: null, initialLoad: true }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(testClass.props().data).toEqual({ });
    testClass.props().nexus.setKey('test10', 'hello', { segment: 'test9' });
    testClass.props().nexus.setKey('test11', 'super', { segment: 'test9' });
    parent.update();
    expect(testClass.props().data).toEqual({ test10: 'hello', test11: 'super' });
  });
});
