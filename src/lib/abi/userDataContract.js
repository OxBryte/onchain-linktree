// UserDataContract ABI
// Keep this as the single source of truth for the contract interface.
export const userDataAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
      { indexed: false, internalType: "string", name: "key", type: "string" },
      { indexed: false, internalType: "string", name: "value", type: "string" },
    ],
    name: "UserDataAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
      { indexed: false, internalType: "string", name: "key", type: "string" },
      { indexed: false, internalType: "string", name: "value", type: "string" },
    ],
    name: "UserDataUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "UserRegistered",
    type: "event",
  },
  {
    inputs: [
      { internalType: "string[]", name: "_keys", type: "string[]" },
      { internalType: "string[]", name: "_values", type: "string[]" },
    ],
    name: "addMultipleUserData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_key", type: "string" },
      { internalType: "string", name: "_value", type: "string" },
    ],
    name: "addUserData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllUsers",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMyDataArray",
    outputs: [
      {
        components: [
          { internalType: "string", name: "key", type: "string" },
          { internalType: "string", name: "value", type: "string" },
        ],
        internalType: "struct UserDataContract.UserData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMyDetails",
    outputs: [
      {
        components: [
          { internalType: "address", name: "walletAddress", type: "address" },
          { internalType: "string", name: "username", type: "string" },
          { internalType: "bool", name: "exists", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct UserDataContract.User",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_walletAddress", type: "address" },
    ],
    name: "getUserDataArray",
    outputs: [
      {
        components: [
          { internalType: "string", name: "key", type: "string" },
          { internalType: "string", name: "value", type: "string" },
        ],
        internalType: "struct UserDataContract.UserData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_walletAddress", type: "address" },
    ],
    name: "getUserDetails",
    outputs: [
      {
        components: [
          { internalType: "address", name: "walletAddress", type: "address" },
          { internalType: "string", name: "username", type: "string" },
          { internalType: "bool", name: "exists", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct UserDataContract.User",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_username", type: "string" }],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_walletAddress", type: "address" },
    ],
    name: "userExists",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];

export default userDataAbi;
