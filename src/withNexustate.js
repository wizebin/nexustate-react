import React, { Component } from 'react';
import { set, values } from 'objer'
import { getShardedNexustate } from 'nexustate';
import clone from 'clone';

function getUnclonedComposedState(initialData, key, value) {
  if (key === null) return value;

  set(initialData, key, value);
  return initialData;
}

function getClonedComposedState(initialData, key, value) {
  return getUnclonedComposedState(clone(initialData), key, value);
}

export default function withNexustate(WrappedComponent, { cloneState = false } = {}) {
  const getComposedState = cloneState ? getClonedComposedState : getUnclonedComposedState;

  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        data: {},
      };

      this.shardState = getShardedNexustate();

      this.nexusFunctions = { push: this.pushData, set: this.setData, delete: this.deleteData, setKey: this.setKeyData, listen: this.listenForChange, listenMultiple: this.listenForMultiple, get: this.getData, unlistenAll: this.unlistenFromAll, unlisten: this.unlisten };
    }

    createShard = (shard, options) => {
      return this.shardState.createShard(shard, options);
    }

    componentWillUnmount() {
      return this.unlistenFromAll({  });
    }

    unlisten = (key, { shard = 'default', resetState = false } = {}) => {
      const result = this.shardState.getShard(shard).unlisten(key, this.handleChange);
      if (resetState) this.setState({ data: {} });
      return result;
    }

    unlistenFromAll = ({ resetState = true } = {}) => {
      const shards = values(this.shardState.getAllShards());
      for (let sharddex = 0; sharddex < shards.length; sharddex += 1) {
        shards[sharddex].unlistenComponent(this);
      }
      if (resetState) this.setState({ data: {} });
    }

    setComposedState = (key, value) => {
      this.setState({
        data: getComposedState(this.state.data, key, value)
      });
    }

    listenForChange = (listener = { shard: 'default', key: '', alias: null, transform: null, initialLoad: true, noChildUpdates: false, noParentUpdates: false }) => {
      const manager = this.shardState.getShard(listener.shard);
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
          const manager = this.shardState.getShard(listeners[listenerdex].shard || 'default');
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

    getData = (path, { shard = 'default' } = {}) => {
      return this.shardState.getShard(shard).get(path);
    }

    setData = (data, { shard = 'default' } = {}) => {
      return this.shardState.getShard(shard).set(data);
    }

    deleteData = (path, { shard = 'default' } = {}) => {
      return this.shardState.getShard(shard).delete(path);
    }

    setKeyData = (path, data, { shard = 'default' } = {}) => {
      return this.shardState.getShard(shard).setKey(path, data);
    }

    pushData = (path, data, { shard = 'default' } = {}) => {
      return this.shardState.getShard(shard).push(path, data);
    }

    render() {
      return <WrappedComponent data={this.state.data} nexus={this.nexusFunctions} {...this.props} />;
    }
  };
}
