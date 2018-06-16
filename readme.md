## Description

This package is used to manage state in react using nexustate

## Basic Usage

*install*

`npm install --save nexustate-react`

*use*

    import { withNexustate } from 'nexustate-react';
    import React, { Component } from 'react';

    class ExampleComponent extends Component {
      componentWillMount() {
        this.props.nexus.listen({ key: 'example', initialLoad: true });
      }
      randomExample = () => {
        this.props.nexus.setKey('example', '' + (Math.random() * 100));
      }
      render() {
        const { example } = this.props.data;
        return (
          <div>
            <div>{example}</div>
            <button onClick={this.randomExample}>Randomize</button>
          </div>
        );
      }
    }

    export default withNexustate(ExampleComponent);
