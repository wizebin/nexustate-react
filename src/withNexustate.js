import React, { Component } from 'react';
import { set, values } from 'objer'
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

      this.dataManagerShards = {
        default: getNexustate(),
        cache: getNexustate('cache', { noPersist: true }),
      };
      this.nexusFunctions = { push: this.pushData, set: this.setData, delete: this.deleteData, setKey: this.setKeyData, listen: this.listenForChange, listenMultiple: this.listenForMultiple, get: this.getData };
    }

    getShard = (shard, options) => {
      if (!this.dataManagerShards[shard]) {
        this.dataManagerShards[shard] = getNexustate(shard, options);
      }
      return this.dataManagerShards[shard];
    }

    createShard = (shard, options) => {
      return this.getShard(shard, options);
    }

    componentWillUnmount() {
      const shards = values(this.dataManagerShards);
      for (let sharddex = 0; sharddex < shards.length; sharddex += 1) {
        shards[sharddex].unlistenComponent(this);
      }
    }

    setComposedState = (key, value) => {
      this.setState({
        data: getComposedState(this.state.data, key, value)
      });
    }

    listenForChange = (listener = { shard: 'default', key: '', alias: null, transform: null, initialLoad: true, noChildUpdates: false, noParentUpdates: false }) => {
      const manager = this.getShard(listener.shard);
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
          const manager = this.getShard(listeners[listenerdex].shard || 'default');
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

    getData = (data, { shard = 'default' } = {}) => {
      return this.getShard(shard).get(data);
    }

    setData = (data, { shard = 'default' } = {}) => {
      return this.getShard(shard).set(data);
    }

    deleteData = (key, { shard = 'default' } = {}) => {
      return this.getShard(shard).delete(key);
    }

    setKeyData = (key, data, { shard = 'default' } = {}) => {
      return this.getShard(shard).setKey(key, data);
    }

    pushData = (key, data, { shard = 'default' } = {}) => {
      return this.getShard(shard).push(key, data);
    }

    render() {
      return <WrappedComponent data={this.state.data} nexus={this.nexusFunctions} {...this.props} />;
    }
  };
}
