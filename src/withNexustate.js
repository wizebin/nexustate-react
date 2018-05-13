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
      this.nexusFunctions = { push: this.pushData, set: this.setData, delete: this.deleteData, setKey: this.setKeyData, listen: this.listenForChange, listenMultiple: this.listenForMultiple };
    }

    componentWillUnmount() {
      this.dataManager.unlistenComponent(this);
    }

    listenForChange = ({ key, alias, transform, initialLoad = true } = {}) => {
      let initialData = this.state.data;
      const listener = { key, alias, callback: this.handleChange, component: this, transform };
      console.log('listening');
      this.dataManager.listen(listener);

      if (initialLoad) {
        const listenData = this.dataManager.getForListener(listener);
        initialData = getComposedState(initialData, listenData.alias || listenData.key, listenData.value)
      }

      this.setState({ data: initialData });
    }

    listenForMultiple = (listeners, { initialLoad = false } = {}) => {
      let initialData = this.state.data;

      for (let listenerdex = 0; listenerdex < listeners.length; listenerdex += 1) {
        this.listenForChange(listeners[listenerdex]);
        if (initialLoad) {
          const listenData = this.dataManager.getForListener(listeners[listenerdex]);
          initialData = getComposedState(initialData, listenData.alias || listenData.key, listenData.value)
        }
      }

      this.setState({ data: initialData });
    }

    handleChange = (changeEvents) => {
      let fullChanges = this.state.data;

      for (let changedex = 0; changedex < changeEvents.length; changedex += 1) {
        const changeEvent = changeEvents[changedex];
        const { alias, key, value } = changeEvent;
        fullChanges = getComposedState(fullChanges, alias || key, value);
      }

      return this.setState({ data: fullChanges });
    }

    setData = (data) => {
      this.dataManager.set(data);
    }

    deleteData = (key) => {
      this.dataManager.delete(key);
    }

    setKeyData = (key, data) => {
      this.dataManager.setKey(key, data);
    }

    pushData = (key, data) => {
      this.dataManager.push(key, data);
    }

    cache = (data) => {
      this.cacheManager.set(data);
    }

    render() {
      return <WrappedComponent data={this.state.data} nexus={this.nexusFunctions} {...this.props} />;
    }
  };
}
