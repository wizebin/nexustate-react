import React, { Component } from 'react';
import { set } from 'objer'
import { getNexustate } from 'nexustate';

function getComposedState(initialData, key, value) {
  if (key === null) return value;

  set(initialData, key, value);
  return initialData;
}

export default function WithNexustate(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        data: {},
      };

      this.dataManager = getNexustate();
      this.cacheManager = getNexustate('cache');
      this.nexusFunctions = { push: this.pushData, set: this.setData, delete: this.deleteData, setKey: this.setKeyData, listen: this.listenForChange, listenMultiple: this.listenForMultiple, get: this.getData };
    }

    componentWillUnmount() {
      this.dataManager.unlistenComponent(this);
    }

    setComposedState = (key, value) => {
      this.setState({
        data: getComposedState(this.state.data, key, value)
      });
    }

    listenForChange = (listener = { key: '', alias: null, transform: null, initialLoad: true, noChildUpdates: false, noParentUpdates: false }) => {
      const modifiedListener = { ...listener, callback: this.handleChange, component: this };
      this.dataManager.listen(modifiedListener);

      if (listener.initialLoad) {
        const listenData = this.dataManager.getForListener(modifiedListener);
        this.setComposedState(listenData.alias || listenData.key, listenData.value)
      }
    }

    listenForMultiple = (listeners, { initialLoad = false } = {}) => {
      for (let listenerdex = 0; listenerdex < listeners.length; listenerdex += 1) {
        this.listenForChange(listeners[listenerdex]);
        if (initialLoad) {
          const listenData = this.dataManager.getForListener(listeners[listenerdex]);
          this.setComposedState(listenData.alias || listenData.key, listenData.value)
        }
      }
    }

    handleChange = (changeEvents) => {
      for (let changedex = 0; changedex < changeEvents.length; changedex += 1) {
        const changeEvent = changeEvents[changedex];
        const { alias, key, value } = changeEvent;
          this.setComposedState(alias || key, value);
      }
    }

    getData = (data) => {
      return this.dataManager.get(data);
    }

    setData = (data) => {
      return this.dataManager.set(data);
    }

    deleteData = (key) => {
      return this.dataManager.delete(key);
    }

    setKeyData = (key, data) => {
      return this.dataManager.setKey(key, data);
    }

    pushData = (key, data) => {
      return this.dataManager.push(key, data);
    }

    cache = (data) => {
      return this.cacheManager.set(data);
    }

    render() {
      return <WrappedComponent data={this.state.data} nexus={this.nexusFunctions} {...this.props} />;
    }
  };
}
