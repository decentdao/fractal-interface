const KeyValuePairsAbi = [
  {
    inputs: [],
    name: 'IncorrectValueCount',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'theAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'key',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'value',
        type: 'string',
      },
    ],
    name: 'ValueUpdated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string[]',
        name: '_keys',
        type: 'string[]',
      },
      {
        internalType: 'string[]',
        name: '_values',
        type: 'string[]',
      },
    ],
    name: 'updateValues',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default KeyValuePairsAbi;
