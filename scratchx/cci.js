(function(ext) {
    ext._shutdown = function() {
        stopCar();
    };

    ext._getStatus = function() {
        return {status: 2, msg: "Ready"};
    };

    var cciAddress = "";

    var lastCheckInResult = false;

    function getCarCoordinates(callback, coordinate) {
        $.ajax({
            type: "GET",
            url: "http://" + cciAddress + "/coordinates",

            success: function(lpsResponse) {
              switch (coordinate) {
                  case "x":
                    callback(lpsResponse.split(" ")[0]);
                    break;
                  case "y":
                    callback(lpsResponse.split(" ")[1]);
                    break;
                  default:
                    callback(lpsResponse);
              }
            },
            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    function getCarHeading(callback) {
        $.ajax({
            type: "GET",
            url: "http://" + cciAddress + "/heading",

            success: function(heading) {
              callback(heading);
            },
            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    function turnCar(heading) {
        $.ajax({
            type: "POST",
            url: "http://" + cciAddress + "/turn?heading=" + heading.toLowerCase(),
            async: false,

            error: function(jqxhr, textStatus, error) {
                stopCar();
                console.log(error);
            }
        });
    }

    function moveCar(duration, distance) {
        var params = "";
        if (distance) {
            params = "?distance=" + distance;
        } else if (duration) {
            params = "?duration=" + duration;
        }

        $.ajax({
            type: "POST",
            url: "http://" + cciAddress + "/move" + params,
            async: false,

            error: function(jqxhr, textStatus, error) {
                stopCar();
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

            success: function(map) {
                callback(map);
            },
            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    function checkIn() {
        $.ajax({
            type: "POST",
            url: "http://" + cciAddress + "/checkin",
            async: false,

            success: function(checkin) {
                lastCheckInResult = (checkin == "1");
            },
            error: function(jqxhr, textStatus, error) {
                lastCheckInResult = false;
                console.log(error);
            }
        });
    }

    ext.init = function(address) {
        cciAddress = address;

        $.ajax({
            type: "GET",
            url: "http://" + cciAddress,
            async: false,

            error: function(jqxhr, textStatus, error) {
                console.log(error);
            }
        });
    }

    ext.get_x = function(callback) {
        getCarCoordinates(callback, "x");
    };

    ext.get_y = function(callback) {
        getCarCoordinates(callback, "y");
    };

    ext.get_heading = function(callback) {
        getCarHeading(callback);
    }

    ext.turn = function(heading) {
        turnCar(heading);
    };

    ext.move = function() {
        moveCar();
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

    ext.read_map = function(callback) {
        getMap(callback);
    };

    ext.extract_map_schedule_element = function(index, map) {
        var element = map.split(",")[index];
        return element ? element : "-1";
    }

    ext.checkin = function() {
        checkIn();
    };

    ext.report_checkin = function() {
        return lastCheckInResult;
    };

    var descriptor = {
        blocks: [
            [" ", "init a car @ %s", "init", "127.0.0.1:8888"],

            ["R", "car's X", "get_x"],
            ["R", "car's Y", "get_y"],

            ["R", "car's heading", "get_heading"],

            [" ", "turn the car %m.directions", "turn"],
            [" ", "turn the car to %n", "turn", 45],

            [" ", "move the car", "move"],
            [" ", "move the car for %n ms", "move_duration", 1000],
            [" ", "move the car %n (~cm)", "move_distance", 10],

            [" ", "stop the car", "stop"],

            ["R", "read the \"map\"", "read_map"],
            ["r", "get %n \"checkpoint\" of %s", "extract_element", 1, ""],
            [" ", "check-in", "checkin"],
            ["b", "last check-in successful", "report_checkin"],
        ],
        menus: {
            directions: [
                "North",
                "North-East",
                "East",
                "South-East",
                "South",
                "South-West",
                "West",
                "North-West",
            ],
        }
    };

    ScratchExtensions.register("Irdeto Hackathon 2016 CCI", descriptor, ext);
})({});
