export default [
  {
    "id": "7",
    "name": "Book Flip - Eden x 204",
    "description": "",
    "settings": {
      "slots": 64,
      "randomPick": false,
      "sequentialPick": true,
      "slotPick": false,
      "layout": {
        "wrapButtons": false
      },
      "controls": {
        "texts": [
          {
            "id": "text",
            "type": "text",
            "options": {
              "multiline": true,
              "singleUse": false,
              "label": "Prompt",
              "submit": true,
              "maxLength": 500,
              "hasClearBtn": true,
              "onChangeEvent": true
            }
          }
        ],
        "buttons": [
          {
            "id": "prev",
            "type": "button",
            "options": {
              "label": "Prev",
              "variant": "black",
              "size": "large",
              "fill": true
            }
          },
          {
            "id": "promptenhance",
            "type": "button",
            "options": {
              "icon": "Magicwand",
              "variant": "yellow",
              "size": "large"
            }
          },
          {
            "id": "next",
            "type": "button",
            "options": {
              "label": "Next",
              "variant": "black",
              "size": "large",
              "fill": true
            }
          }
        ]
      }
    }
  },
  {
    "id": "5",
    "name": "Prompt Battle",
    "description": "Mars be prompin'",
    "settings": {
      "slots": 64,
      "randomPick": false,
      "sequentialPick": true,
      "slotPick": false,
      "controls": {
        "eden": [
          {
            "id": "eden",
            "type": "eden"
          }
        ]
      }
    }
  },
  {
    "id": "6",
    "name": "Draw Diffusion",
    "description": "Live Painting with LCM",
    "settings": {
      "slots": 10,
      "randomPick": false,
      "sequentialPick": true,
      "slotPick": true,
      "controls": {
        "xy": [
          {
            "id": "xy",
            "type": "xy",
            "options": {
              "mode": "paint"
            }
          }
        ],
        "texts": [
          {
            "id": "prompt1",
            "type": "text",
            "options": {
              "label": "Prompt 1",
              "submit": false,
              "maxLength": 120,
              "hasClearBtn": true
            }
          },
          {
            "id": "prompt2",
            "type": "text",
            "options": {
              "label": "Prompt 2",
              "submit": false,
              "maxLength": 120,
              "hasClearBtn": true
            }
          }
        ],
        "buttons": [
          {
            "id": "addpreset",
            "type": "button",
            "options": {
              "admin": true,
              "label": "Add Preset",
              "variant": "black",
              "size": "large"
            }
          },
          {
            "id": "draw",
            "type": "toggle",
            "options": {
              "icon": "Draw",
              "label": "Draw",
              "variant": "red",
              "size": "large"
            }
          },
          {
            "id": "random",
            "type": "button",
            "options": {
              "icon": "Dice",
              "label": "Randomize",
              "variant": "yellow",
              "size": "large"
            }
          },
          {
            "id": "freeze",
            "type": "toggle",
            "options": {
              "label": "Freeze",
              "icon": "Freeze",
              "variant": "blue",
              "size": "large"
            }
          }
        ]
      }
    }
  },
  {
    "id": "1",
    "name": "Default",
    "description": "Awesome session description",
    "settings": {
      "slots": 4,
      "randomPick": false,
      "slotPick": true,
      "sequentialPick": true,
      "controls": {
        "xy": [
          {
            "id": "xy",
            "type": "xy",
            "options": {
              "mode": "crosshair"
            }
          }
        ],
        "buttons": [
          {
            "id": "b1",
            "type": "button"
          },
          {
            "id": "b2",
            "type": "button"
          },
          {
            "id": "b3",
            "type": "button"
          },
          {
            "id": "b4",
            "type": "button"
          }
        ]
      }
    }
  },
  {
    "id": "2",
    "name": "Sensors",
    "description": "Demoing accelerometer and gyroscope input",
    "settings": {
      "slots": 4,
      "randomPick": false,
      "slotPick": true,
      "sequentialPick": true,
      "controls": {
        "buttons": [
          {
            "id": "b1",
            "type": "button"
          },
          {
            "id": "b2",
            "type": "button"
          },
          {
            "id": "b3",
            "type": "button"
          },
          {
            "id": "b4",
            "type": "button"
          }
        ],
        "sensors": [
          {
            "id": "acc",
            "type": "accelerometer"
          },
          {
            "id": "gyro",
            "type": "gyroscope"
          }
        ]
      }
    }
  },
  {
    "id": "3",
    "name": "Faders",
    "description": "Uses linear faders",
    "settings": {
      "slots": 4,
      "randomPick": false,
      "slotPick": true,
      "sequentialPick": true,
      "controls": {
        "buttons": [
          {
            "id": "b1",
            "type": "button"
          },
          {
            "id": "b2",
            "type": "button"
          },
          {
            "id": "b3",
            "type": "button"
          },
          {
            "id": "b4",
            "type": "button"
          }
        ],
        "faders": [
          {
            "id": "f1",
            "type": "fader"
          },
          {
            "id": "f2",
            "type": "fader"
          },
          {
            "id": "f3",
            "type": "fader"
          },
          {
            "id": "f4",
            "type": "fader"
          }
        ]
      }
    }
  },
  {
    "id": "4",
    "name": "Text prompt",
    "description": "Testing texts",
    "settings": {
      "slots": 2,
      "randomPick": true,
      "slotPick": true,
      "sequentialPick": false,
      "controls": {
        "text": [
          {
            "id": "text",
            "type": "text",
            "options": {
              "submit": true
            }
          }
        ],
        "xy": [
          {
            "id": "xy",
            "type": "xy",
            "options": {
              "mode": "crosshair"
            }
          }
        ],
        "buttons": [
          {
            "id": "b1",
            "type": "button"
          },
          {
            "id": "b2",
            "type": "button"
          },
          {
            "id": "b3",
            "type": "button"
          },
          {
            "id": "b4",
            "type": "button"
          }
        ]
      }
    }
  }
]