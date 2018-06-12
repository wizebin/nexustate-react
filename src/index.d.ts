import { Component } from 'react';
import Nexustate, { getShardedNexustate, ShardedNexustate } from 'nexustate';

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

declare class NexustateWrapper extends Component<NexustateProps, any> {
}

function withNexustate(Component): NexustateWrapper;
function getNexustate(string): Nexustate;

export { Nexustate, withNexustate, getNexustate, ShardedNexustate, getShardedNexustate }
