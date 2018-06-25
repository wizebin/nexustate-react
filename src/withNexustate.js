import React, { Component } from 'react';
import { NexustateAgent, getShardedNexustate } from 'nexustate';

export default function withNexustate(WrappedComponent, { cloneState = false } = {}) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.agent = new NexustateAgent({ shardedNexustate: getShardedNexustate(), onChange: this.changeState, cloneState });
      this.state = { data: {} };
    }

    changeState = (nextState) => {
      return this.setState({ data: nextState });
    }

    componentWillUnmount() {
      return this.agent.cleanup();
    }

    render() {
      return <WrappedComponent data={this.state.data} nexus={this.agent} {...this.props} />;
    }
  };
}
