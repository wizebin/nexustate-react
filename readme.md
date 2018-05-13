## Description

This package is used to manage state in react

## Basic Usage

*install*

`npm install --save wizebin/nexustate-react`

*use*

    import { withNexustate } from 'nexustate-react';
    import React, { Component } from 'react';

    class ExampleComponent extends Component {
      componentWillMount() {
        this.props.nexus.listen({ key: example, initialLoad: true });
      }
      render() {
        const { example } = this.props.data;
        return (
          <div>{example}</div>
        );
      }
    }

    export default withNexustate(ExampleComponent);
