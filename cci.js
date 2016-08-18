(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.get_position = function(callback) {
        var position = '123,123';
        callback(position);
    };

    ext.read_compass = function(callback) {
        var direction = '-57';
        callback(direction);
    };

    ext.turn = function(direction, callback) {
        callback(direction)
    };

    ext.move = function(direction, callback) {
        callback();
    };

    ext.stop = function(callback) {
        var position = '123,123';
        callback(position);
    };

    ext.read_nfc = function(callback) {
        var data = "Data from the NFC tag";
        callback(data);
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['R', 'get position',               'get_position'      ],
            ['R', 'read compass',               'read_compass'      ],

            ['R', 'turn %m.turn_directions',    'turn'              ],
            ['R', 'turn %n',                    'turn'              ],

            [' ', 'move %m.move_directions',    'move_direction'    ],
            [' ', 'move',                       'move'              ],
            ['R', 'stop',                       'stop'              ],
        ],
        menus: {
            turn_directions: [
                'north',
                'east',
                'south',
                'west',
            ],
            move_directions: [
                'forward',
                'backwards',
                'north',
                'east',
                'south',
                'west',
            ]
        }
    };

    // Register the extension
    ScratchExtensions.register('CCI', descriptor, ext);
})({});
