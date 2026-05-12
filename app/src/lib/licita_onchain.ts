/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/licita_onchain.json`.
 */
export type LicitaOnchain = {
  "address": "9Cif5osZpEmSnf5uWC21TL7oYgowjXd5k6EfkKYrbg9f",
  "metadata": {
    "name": "licitaOnchain",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Licita OnChain — pregão eletrônico com commit-reveal"
  },
  "instructions": [
    {
      "name": "commitProposal",
      "docs": [
        "Fornecedor envia proposta selada (apenas hash).",
        "hash = keccak256(value_le_bytes || nonce || bidder_pubkey)",
        "Ninguém — nem o pregoeiro — consegue ver o valor antes do reveal."
      ],
      "discriminator": [
        236,
        18,
        160,
        143,
        112,
        212,
        3,
        224
      ],
      "accounts": [
        {
          "name": "licitation",
          "writable": true
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "licitation"
              },
              {
                "kind": "account",
                "path": "bidder"
              }
            ]
          }
        },
        {
          "name": "bidder",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "commitHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "createLicitation",
      "docs": [
        "Cria uma nova licitação. Apenas o pregoeiro (signer) pode fazer.",
        "O hash do edital é registrado on-chain; o PDF fica off-chain (IPFS)."
      ],
      "discriminator": [
        90,
        6,
        234,
        130,
        127,
        96,
        94,
        125
      ],
      "accounts": [
        {
          "name": "licitation",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  99,
                  105,
                  116,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "editalHash"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "editalHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "editalUri",
          "type": "string"
        },
        {
          "name": "estimatedValue",
          "type": "u64"
        },
        {
          "name": "commitPhaseEnd",
          "type": "i64"
        },
        {
          "name": "revealPhaseEnd",
          "type": "i64"
        }
      ]
    },
    {
      "name": "homologate",
      "docs": [
        "Pregoeiro homologa o resultado após fim da fase de revelação."
      ],
      "discriminator": [
        78,
        102,
        67,
        234,
        216,
        3,
        41,
        121
      ],
      "accounts": [
        {
          "name": "licitation",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "revealProposal",
      "docs": [
        "Fornecedor revela o conteúdo da proposta na fase de revelação.",
        "O programa recomputa o hash e valida — se não bater, rejeita.",
        "Ranqueia automaticamente: menor valor vira \"lowest_value\"."
      ],
      "discriminator": [
        228,
        170,
        154,
        140,
        125,
        98,
        129,
        114
      ],
      "accounts": [
        {
          "name": "licitation",
          "writable": true
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "licitation"
              },
              {
                "kind": "account",
                "path": "bidder"
              }
            ]
          }
        },
        {
          "name": "bidder",
          "signer": true,
          "relations": [
            "proposal"
          ]
        }
      ],
      "args": [
        {
          "name": "value",
          "type": "u64"
        },
        {
          "name": "nonce",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "licitation",
      "discriminator": [
        254,
        122,
        232,
        31,
        4,
        181,
        16,
        26
      ]
    },
    {
      "name": "proposal",
      "discriminator": [
        26,
        94,
        189,
        187,
        116,
        136,
        53,
        33
      ]
    }
  ],
  "events": [
    {
      "name": "licitationCreated",
      "discriminator": [
        70,
        94,
        192,
        56,
        155,
        1,
        107,
        80
      ]
    },
    {
      "name": "licitationHomologated",
      "discriminator": [
        22,
        143,
        102,
        232,
        20,
        86,
        110,
        154
      ]
    },
    {
      "name": "proposalCommitted",
      "discriminator": [
        85,
        6,
        31,
        78,
        78,
        183,
        8,
        55
      ]
    },
    {
      "name": "proposalRevealed",
      "discriminator": [
        225,
        87,
        185,
        62,
        60,
        195,
        19,
        207
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "titleTooLong",
      "msg": "Title too long (max 100 chars)"
    },
    {
      "code": 6001,
      "name": "uriTooLong",
      "msg": "URI too long (max 200 chars)"
    },
    {
      "code": 6002,
      "name": "commitPhaseInPast",
      "msg": "Commit phase end must be in the future"
    },
    {
      "code": 6003,
      "name": "invalidTimeline",
      "msg": "Invalid timeline: commit phase must end before reveal phase"
    },
    {
      "code": 6004,
      "name": "licitationNotOpen",
      "msg": "Licitation is not open"
    },
    {
      "code": 6005,
      "name": "commitPhaseEnded",
      "msg": "Commit phase has ended"
    },
    {
      "code": 6006,
      "name": "commitPhaseStillOpen",
      "msg": "Commit phase is still open — wait for reveal phase"
    },
    {
      "code": 6007,
      "name": "revealPhaseEnded",
      "msg": "Reveal phase has ended"
    },
    {
      "code": 6008,
      "name": "revealPhaseStillOpen",
      "msg": "Reveal phase is still open — wait to homologate"
    },
    {
      "code": 6009,
      "name": "proposalNotCommitted",
      "msg": "Proposal not in Committed state"
    },
    {
      "code": 6010,
      "name": "hashMismatch",
      "msg": "Hash mismatch — value or nonce incorrect"
    },
    {
      "code": 6011,
      "name": "invalidValue",
      "msg": "Invalid value (must be > 0)"
    },
    {
      "code": 6012,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6013,
      "name": "noValidProposal",
      "msg": "No valid proposal to homologate"
    }
  ],
  "types": [
    {
      "name": "licitation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "editalHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "editalUri",
            "type": "string"
          },
          {
            "name": "estimatedValue",
            "type": "u64"
          },
          {
            "name": "commitPhaseEnd",
            "type": "i64"
          },
          {
            "name": "revealPhaseEnd",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "licitationStatus"
              }
            }
          },
          {
            "name": "proposalCount",
            "type": "u32"
          },
          {
            "name": "lowestValue",
            "type": "u64"
          },
          {
            "name": "winner",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "homologatedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "licitationCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "licitation",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "estimatedValue",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "licitationHomologated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "licitation",
            "type": "pubkey"
          },
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "winningValue",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "licitationStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "homologated"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "licitation",
            "type": "pubkey"
          },
          {
            "name": "bidder",
            "type": "pubkey"
          },
          {
            "name": "commitHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "committedAt",
            "type": "i64"
          },
          {
            "name": "revealedValue",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "revealedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "proposalStatus"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "proposalCommitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "licitation",
            "type": "pubkey"
          },
          {
            "name": "bidder",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "proposalRevealed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "licitation",
            "type": "pubkey"
          },
          {
            "name": "bidder",
            "type": "pubkey"
          },
          {
            "name": "value",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "proposalStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "committed"
          },
          {
            "name": "revealed"
          },
          {
            "name": "disqualified"
          }
        ]
      }
    }
  ]
};
