import React, { Component } from "react";
import { mount, configure } from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import withNexustate from "./withNexustate";
import { getShardedNexustate } from "nexustate";
import { has } from "objer";

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
const WrappedTestClass = withNexustate(TestClass, { cloneState: true });

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
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ test: undefined });
    parent.unmount();
  });
  it("fills data and receives updates", () => {
    const parent = mountTestClass([{ key: 'test2', initialLoad: true }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ test2: undefined });
    testClass.props().nexus.set('test2', 'hello', { immediatePersist: true });
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ test2: 'hello' });
    parent.unmount();
  });
  it("fills data and receives updates with aliases", () => {
    const parent = mountTestClass([{ key: 'test3', initialLoad: true, alias: 'bumpkiss' }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ bumpkiss: undefined });
    testClass.props().nexus.set('test3', 'hello');
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ bumpkiss: 'hello' });
    parent.unmount();
  });
  it("fills data and receives updates with transforms", () => {
    const parent = mountTestClass([{ key: 'test4', initialLoad: true, transform: item => item ? item + '_transformed' : item }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ test4: undefined });
    testClass.props().nexus.set('test4', 'hello');
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ test4: 'hello_transformed' });
    parent.unmount();
  });
  it("receives updates from child updates", () => {
    const parent = mountTestClass([{ key: 'test5', initialLoad: true }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ test5: undefined });
    testClass.props().nexus.set(['test5', 'a', 'b', 'c'], 'hello');
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ test5: { a: { b: { c: 'hello' } } } });
    parent.unmount();
  });
  it("receives updates from two shards", () => {
    const parent = mountTestClass([{ shard: 'a', key: 'test6', initialLoad: true }, { shard: 'b', key: 'test6', initialLoad: true, alias: 'test7' }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ test6: undefined, test7: undefined });
    testClass.props().nexus.set('test6', 'hello', { shard: 'b' });
    testClass.props().nexus.set('test6', 'silly', { shard: 'a' });
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ test6: 'silly', test7: 'hello' });
    parent.unmount();
  });
  it("does not load initially if flag is unset", () => {
    const parent = mountTestClass([{ key: 'test8', initialLoad: false }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ });
    testClass.props().nexus.set('test8', 'hello');
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ test8: 'hello' });
    parent.unmount();
  });
  it("listens for everything is key is null", () => {
    const parent = mountTestClass([{ shard: 'test9', key: null, initialLoad: true }]);
    const testClass = parent.find(TestClass);
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ });
    testClass.props().nexus.set('test10', 'hello', { shard: 'test9' });
    testClass.props().nexus.set('test11', 'super', { shard: 'test9' });
    parent.update();
    expect(parent.find(TestClass).props().data).toEqual({ test10: 'hello', test11: 'super' });
    parent.unmount();
  });
  it("nexustate has no active listeners when everything is unmounted", () => {
    const shardedNexustate = getShardedNexustate();
    const defaultShard = shardedNexustate.getShard();
    function assureNoListeners(root) {
      if (has(root, 'listeners')) {
        if (root.listeners && root.listeners.length > 0) return false;
      }
      if (has(root, 'subkeys')) return assureNoListeners(root.subkeys);
      return true;
    }
    expect(assureNoListeners(defaultShard.listenerObject)).toEqual(true);
  });
});
