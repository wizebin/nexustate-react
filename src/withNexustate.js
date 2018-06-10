import React, { Component } from 'react';
import { set } from 'objer'
import { getNexustate } from 'nexustate';

function getComposedState(initialData, key, value) {
  if (key === null) return value;

  set(initialData, key, value);
  return initialData;
}

export default function withNexustate(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        data: {},
      };

      this.dataManagerSegments = {
        default: getNexustate(),
        cache: getNexustate('cache', { noPersist: true }),
      };
      this.dataManager = getNexustate();
      this.cacheManager = getNexustate('cache');
      this.nexusFunctions = { push: this.pushData, set: this.setData, delete: this.deleteData, setKey: this.setKeyData, listen: this.listenForChange, listenMultiple: this.listenForMultiple, get: this.getData };
    }

    getSegment = (segment, options) => {
      if (!this.dataManagerSegments[segment]) {
        this.dataManagerSegments[segment] = getNexustate(segment, options);
      }
      return this.dataManagerSegments[segment];
    }

    createSegment = (segment, options) => {
      return this.getSegment(segment, options);
    }

    componentWillUnmount() {
      this.dataManager.unlistenComponent(this);
    }

    setComposedState = (key, value) => {
      this.setState({
        data: getComposedState(this.state.data, key, value)
      });
    }

    listenForChange = (listener = { segment: 'default', key: '', alias: null, transform: null, initialLoad: true, noChildUpdates: false, noParentUpdates: false }) => {
      const manager = this.getSegment(listener.segment);
      const modifiedListener = { ...listener, callback: this.handleChange, component: this };
      manager.listen(modifiedListener);

      if (listener.initialLoad) {
        const listenData = manager.getForListener(modifiedListener);
        this.setComposedState(listenData.alias || listenData.key, listenData.value)
      }
    }

    listenForMultiple = (listeners, { initialLoad = false } = {}) => {
      for (let listenerdex = 0; listenerdex < listeners.length; listenerdex += 1) {
        this.listenForChange(listeners[listenerdex]);
        if (initialLoad) {
          const manager = this.getSegment(listeners[listenerdex].segment || 'default');
          const listenData = manager.getForListener(listeners[listenerdex]);
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

    getData = (data, { segment = 'default' } = {}) => {
      return this.getSegment(segment).get(data);
    }

    setData = (data, { segment = 'default' } = {}) => {
      return this.getSegment(segment).set(data);
    }

    deleteData = (key, { segment = 'default' } = {}) => {
      return this.getSegment(segment).delete(key);
    }

    setKeyData = (key, data, { segment = 'default' } = {}) => {
      return this.getSegment(segment).setKey(key, data);
    }

    pushData = (key, data, { segment = 'default' } = {}) => {
      return this.getSegment(segment).push(key, data);
    }

    render() {
      return <WrappedComponent data={this.state.data} nexus={this.nexusFunctions} {...this.props} />;
    }
  };
}
