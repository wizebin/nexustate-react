import React, { Component } from 'react';
import { NexustateAgent, getShardedNexustate } from 'nexustate';

export default function withNexustate(WrappedComponent, { shardedNexustate = null, cloneState = false } = {}) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.agent = new NexustateAgent({ shardedNexustate: shardedNexustate || getShardedNexustate(), onChange: this.changeState, cloneBeforeSet: cloneState });
      this.state = {};
    }

    changeState = () => this.setState(this.state);

    componentWillUnmount() {
      return this.agent.cleanup();
    }

    render() {
      return <WrappedComponent data={this.agent.data} nexus={this.agent} {...this.props} />;
    }
  };
}
