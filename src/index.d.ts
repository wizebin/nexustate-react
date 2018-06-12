import { Component } from 'react';
import Nexustate, { getShardedNexustate, ShardedNexustate } from 'nexustate';

type KeyType = string | string[];

type NexustateTransform = (any) => any;

type NexustateSetOptions = {
    immediatePersist: boolean,
    noNotify: boolean,
};

type NexustateKeyChange = {
    keyChange: KeyType,
    alias: KeyType,
    key: KeyType,
    value: any,
};

type NexustateChangeCallback = (NexustateKeyChange) => void;

type NexustateListener = {
    key: KeyType,
    alias: string,
    callback: NexustateChangeCallback,
    transform: NexustateTransform,
};

type NexusType = {
    push: (KeyType) => any,
    set: (object) => any,
    delete: (KeyType) => void,
    setKey: (KeyType, any) => void
    listen: (NexustateListener) => void,
    get: (KeyType) => any,
    unlistenAll: () => void,
    unlisten: (KeyType, NexustateChangeCallback) => void
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
