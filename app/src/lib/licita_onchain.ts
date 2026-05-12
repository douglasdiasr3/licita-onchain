export type LicitaOnchain = {
  "address": "7Kob7MLNcumNP9irCTPqY2H3iRF8nPuVXxU2JX1MDm7s",
  "metadata": {
    "name": "licita_onchain",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Licita OnChain \u2014 preg\u00e3o eletr\u00f4nico com commit-reveal"
  },
  "instructions": [
    {
      "name": "commitProposal",
      "docs": [
        "Fornecedor envia proposta selada (apenas hash).",
        "hash = keccak256(value_le_bytes || nonce || bidder_pubkey)",
        "Ningu\u00e9m \u2014 nem o pregoeiro \u2014 consegue ver o valor antes do reveal."
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
          "name": "system_program",
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
        "Cria uma nova licita\u00e7\u00e3o. Apenas o pregoeiro (signer) pode fazer.",
        "O hash do edital \u00e9 registrado on-chain; o PDF fica off-chain (IPFS)."
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
                "path": "edital_hash"
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
          "name": "system_program",
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
          "name": "description",
          "type": "string"
        },
        {
          "name": "orgao",
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
      "name": "createProfile",
      "docs": [
        "Cria ou atualiza o perfil do usu\u00e1rio on-chain."
      ],
      "discriminator": [
        225,
        205,
        234,
        143,
        17,
        186,
        50,
        220
      ],
      "accounts": [
        {
          "name": "profile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "authority"
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
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "document",
          "type": "string"
        },
        {
          "name": "role",
          "type": {
            "defined": {
              "name": "UserRole"
            }
          }
        }
      ]
    },
    {
      "name": "homologate",
      "docs": [
        "Pregoeiro homologa o resultado ap\u00f3s fim da fase de revela\u00e7\u00e3o."
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
        "Fornecedor revela o conte\u00fado da proposta na fase de revela\u00e7\u00e3o.",
        "O programa recomputa o hash e valida \u2014 se n\u00e3o bater, rejeita.",
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
    },
    {
      "name": "userProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
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
      "msg": "Commit phase is still open \u2014 wait for reveal phase"
    },
    {
      "code": 6007,
      "name": "revealPhaseEnded",
      "msg": "Reveal phase has ended"
    },
    {
      "code": 6008,
      "name": "revealPhaseStillOpen",
      "msg": "Reveal phase is still open \u2014 wait to homologate"
    },
    {
      "code": 6009,
      "name": "proposalNotCommitted",
      "msg": "Proposal not in Committed state"
    },
    {
      "code": 6010,
      "name": "hashMismatch",
      "msg": "Hash mismatch \u2014 value or nonce incorrect"
    },
    {
      "code": 6011,
      "name": "invalidValue",
      "msg": "Invalid value (must be > 0)"
    },
    {
      "code": 6012,
      "name": "unauthorized",
      "msg": "Unauthorized"
    },
    {
      "code": 6013,
      "name": "noValidProposal",
      "msg": "No valid proposal to homologate"
    },
    {
      "code": 6014,
      "name": "nameTooLong",
      "msg": "Name too long (max 50 chars)"
    },
    {
      "code": 6015,
      "name": "documentTooLong",
      "msg": "Document too long (max 20 chars)"
    },
    {
      "code": 6016,
      "name": "descriptionTooLong",
      "msg": "Description too long (max 200 chars)"
    },
    {
      "code": 6017,
      "name": "orgaoTooLong",
      "msg": "Orgao too long (max 50 chars)"
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
            "name": "description",
            "type": "string"
          },
          {
            "name": "orgao",
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
                "name": "LicitationStatus"
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
                "name": "ProposalStatus"
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
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "document",
            "type": "string"
          },
          {
            "name": "role",
            "type": {
              "defined": {
                "name": "UserRole"
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
      "name": "userRole",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pregoeiro"
          },
          {
            "name": "fornecedor"
          }
        ]
      }
    }
  ]
};
