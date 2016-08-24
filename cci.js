(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    var POLLING_INTERVAL = 1000;

    var cciIpAddress = "";

    var lps = {
        x: 0,
        y: 0
    };
    var heading = 0;
    var tag = "";

    function getCoordinates() {
        $.ajax({
            type: "GET",
            url: "http://" + cciIpAddress + "/coordinates",

            success: function(data) {
                lps = data;
            },
            error: function(jqxhr, textStatus, error) {
                alert(error);
            }
        });
    }

    function getHeading() {
        $.ajax({
            type: "GET",
            url: "http://" + cciIpAddress + "/heading",

            success: function(data) {
                heading = data;
            },
            error: function(jqxhr, textStatus, error) {
                alert(error);
            }
        });
    }

    function getNFC() {
        $.ajax({
            type: "GET",
            url: "http://" + cciIpAddress + "/nfc",
            async: false,

            success: function(data) {
                tag = data;
            },
            error: function(jqxhr, textStatus, error) {
                alert(error);
            }
        });
    }

    function turn(heading) {
        $.ajax({
            type: "POST",
            url: "http://" + cciIpAddress + "/turn?heading=" + heading,
            async: false,

            error: function(jqxhr, textStatus, error) {
                alert(error);
            }
        });
    }

    function move(distance) {
        $.ajax({
            type: "POST",
            url: "http://" + cciIpAddress + "/move?distance=" + distance,
            async: false,

            error: function(jqxhr, textStatus, error) {
                alert(error);
            }
        });
    }

    function stop() {
        $.ajax({
            type: "POST",
            url: "http://" + cciIpAddress + "/stop",
            async: false,

            error: function(jqxhr, textStatus, error) {
                alert(error);
            }
        });
    }

    ext.init = function(ip) {
        cciIpAddress = ip;

        var resolved;
        $.ajax({
            type: "GET",
            url: "http://" + cciIpAddress + "/health",
            async: false,

            success: function() {
                setInterval(getCoordinates, POLLING_INTERVAL);
                setInterval(getHeading, POLLING_INTERVAL);
                resolved = true;
            },
            error: function(jqxhr, textStatus, error) {
                resolved = false;
            }
        });

        return resolved;
    }

    ext.get_x = function() {
        return lps.x;
    };

    ext.get_y = function(callback) {
        return lps.y;
    };

    ext.get_heading = function() {
        return heading;
    }

    ext.read_nfc = function() {
        return getNFC();
    };

    ext.turn = function(heading) {
        turn(heading);
    };

    ext.move = function(duration) {
        move(duration);
    };

    ext.stop = function() {
        stop();
    };

    var descriptor = {
        blocks: [
            ['h', 'init car %s', 'init'],

            ['R', 'get car X', 'get_position'],
            ['R', 'get car Y', 'get_position'],

            ['R', 'get car heading', 'read_compass'],

            ['R', 'read NFC tag', 'read_nfc'],

            [' ', 'turn %n', 'turn'],
            [' ', 'turn %m.directions', 'turn'],

            [' ', 'move', 'move'],
            [' ', 'move for distance %n', 'move'],

            [' ', 'stop', 'stop'],
        ],
        menus: {
            directions: [
                'north',
                'east',
                'south',
                'west',
            ],
        }
    };

    // Register the extension
    ScratchExtensions.register('CCI', descriptor, ext);
})({});
