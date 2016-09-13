(function(ext) {
    ext._shutdown = function() {
        stopCar();
    };

    ext._getStatus = function() {
        return {status: 2, msg: "Ready"};
    };

    var POLLING_INTERVAL = 200;

    var cciAddress = "";

    var lps = {
        x: 0,
        y: 0
    };
    var heading = 0;
    var lastCheckin = false;

    function getCarCoordinates() {
        $.ajax({
            type: "GET",
            url: "http://" + cciAddress + "/coordinates",

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
            url: "http://" + cciAddress + "/heading",

            success: function(data) {
                heading = data;
            },
            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    function turnCar(heading) {
        $.ajax({
            type: "POST",
            url: "http://" + cciAddress + "/turn?heading=" + heading,
            async: false,

            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    function moveCar(duration, distance) {
        $.ajax({
            type: "POST",
            url: "http://" + cciAddress + "/move?duration=" + duration + "&distance=" + distance,
            async: false,

            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    function stopCar() {
        $.ajax({
            type: "POST",
            url: "http://" + cciAddress + "/stop",
            async: false,

            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    function getMap(callback) {
        $.ajax({
            type: "GET",
            url: "http://" + cciAddress + "/map",
            async: false,

            success: function(data) {
                callback(data);
            },
            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    function checkin(callback) {
        $.ajax({
            type: "POST",
            url: "http://" + cciAddress + "/checkin",
            async: false,

            success: function(data) {
                lastCheckin = !!data;
            },
            error: function(jqxhr, textStatus, error) {
                console.log(error);
                lastCheckin = false;
            }
        });
    }

    ext.init = function(address) {
        cciAddress = address;

        $.ajax({
            type: "GET",
            url: "http://" + cciAddress + "/health",
            async: false,

            success: function() {
                setInterval(getCarCoordinates, POLLING_INTERVAL);
                setInterval(getCarHeading, POLLING_INTERVAL);
            },
            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    ext.get_x = function() {
        return lps.x;
    };

    ext.get_y = function() {
        return lps.y;
    };

    ext.get_heading = function() {
        return heading;
    }

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

    ext.read_map = function() {
        return getMap();
    };

    ext.extract_element = function(index, map) {
        var element = map.split(" ")[index];
        return element ? element : "-1";
    }

    ext.checkin = function() {
        checkin();
    };

    ext.report_checkin = function() {
        return lastCheckin;
    };

    var descriptor = {
        blocks: [
            [" ", "init a car @ %s", "init", "127.0.0.1:8888"],

            ["r", "get the car's X", "get_x"],
            ["r", "get the car's Y", "get_y"],

            ["r", "get the car's heading", "get_heading"],

            [" ", "turn the car %n", "turn", 90],
            [" ", "turn the car %m.directions", "turn"],

            [" ", "move the car", "move"],
            [" ", "move the car for %n ms", "move_duration", 1000],
            [" ", "move the car for %n cm", "move_distance", 10],

            [" ", "stop the car", "stop"],

            ["R", "read the \"map\"", "read_map"],
            ["r", "get %n \"checkpoint\" of %s", "extract_element", 1, ""],
            [" ", "check-in", "checkin"],
            ["b", "last check-in successful", "report_checkin"],
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

    ScratchExtensions.register("Irdeto Hackathon 2016 CCI", descriptor, ext);
})({});
