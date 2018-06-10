import * as React from 'react';

type KeyType = string | string[];

type NexusType = {
    push: (KeyType) => any,
    set: (object) => any,
    delete: (KeyType) => void,
    setKey: (KeyType, any) => void
    listen: (KeyType) => void,
    get: (KeyType) => any
};

interface NexustateProps {
  nexus: NexusType,
  data: object
}

declare class NexustateWrapper extends React.Component<NexustateProps, any> {
}

export default (React.Component) => NexustateWrapper;
