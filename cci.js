(function(ext) {
    ext._shutdown = function() {
        stopCar();
    };

    ext._getStatus = function() {
        return {status: 2, msg: "Ready"};
    };

    var POLLING_INTERVAL = 500;

    var cciIpAddress = "";

    var lps = {
        x: 0,
        y: 0
    };
    var heading = 0;
    var tag = "";

    function getCarCoordinates() {
        $.ajax({
            type: "GET",
            url: "http://" + cciIpAddress + "/coordinates",

            success: function(data) {
                lps = data;
            },
            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    function getCarHeading() {
        $.ajax({
            type: "GET",
            url: "http://" + cciIpAddress + "/heading",

            success: function(data) {
                heading = data;
            },
            error: function(jqxhr, textStatus, error) {
                console.log(error);
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
                console.log(error);
            }
        });
    }

    function turnCar(heading) {
        $.ajax({
            type: "POST",
            url: "http://" + cciIpAddress + "/turn?heading=" + heading,
            async: false,

            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    function moveCar(duration, distance) {
        $.ajax({
            type: "POST",
            url: "http://" + cciIpAddress + "/move?duration=" + duration + "&distance=" + distance,
            async: false,

            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    function stopCar() {
        $.ajax({
            type: "POST",
            url: "http://" + cciIpAddress + "/stop",
            async: false,

            error: function(jqxhr, textStatus, error) {
                console.log(error);
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
                setInterval(getCarCoordinates, POLLING_INTERVAL);
                setInterval(getCarHeading, POLLING_INTERVAL);
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
        turnCar(heading);
    };

    ext.move_duration = function(duration) {
        moveCar(duration, null);
    };

    ext.move_distance = function(distance) {
        moveCar(null, distance);
    };

    ext.stop = function() {
        stopCar();
    };

    var descriptor = {
        blocks: [
            [" ", "init a car @ %s", "init", "127.0.0.1"],

            ["R", "get the car's X", "get_position"],
            ["R", "get the car's Y", "get_position"],

            ["R", "get the car's heading", "read_compass"],

            [" ", "turn the car %n", "turn", 90],
            [" ", "turn the car %m.directions", "turn"],

            [" ", "move the car", "move"],
            [" ", "move the car for %n ms", "move_duration", 1000],
            [" ", "move the car for distance %n", "move_distance", 10],

            [" ", "stop the car", "stop"],

            ["R", "read an NFC tag under the car", "read_nfc"],
        ],
        menus: {
            directions: [
                "north",
                "east",
                "south",
                "west",
            ],
        }
    };

    ScratchExtensions.register("CCI", descriptor, ext);
})({});
