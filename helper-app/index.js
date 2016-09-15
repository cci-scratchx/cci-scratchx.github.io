var args = require("argv").option([
    {
        name: "port",
        short: "p",
        type: "int",
        description: "Port for the web server to listen to"
    },
    {
        name: "cciLPS",
        short: "l",
        type: "path",
        description: "CCI LPS filepath",
    },
    {
        name: "cciCompass",
        short: "c",
        type: "path",
        description: "CCI Compass filepath"
    },
    {
        name: "cciVehicle",
        short: "v",
        type: "path",
        description: "CCI Vehicle filepath"
    },
    {
        name: "cciMap",
        short: "m",
        type: "path",
        description: "CCI Map filepath",
    },
    {
        name: "cciCheckIn",
        short: "x",
        type: "path",
        description: "CCI Check-In filepath",
    },
]).run();

////////////////////////////////////////////////////////////////////////////////

var express = require("express"), url = require("url"), cors = require("cors"),
    app = express(),
    server = require("http").createServer(app);
    app.use(cors());
server.listen(args.options.port ? args.options.port : 8888);

process.on("uncaughtException", function(err) {
    console.log(err);
});

var validator = require("validator");

////////////////////////////////////////////////////////////////////////////////

var sleep = require("sleep");

////////////////////////////////////////////////////////////////////////////////

app.get("/", function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hey! Ho! Let\"s Go!");
});

////////////////////////////////////////////////////////////////////////////////

var cci = {
    lps: {
        positioning: {
            filepath: args.options.cciLPS
        },
        map : {
            filepath: args.options.cciMap
        },
        checkin : {
            filepath: args.options.cciCheckIn
        },
    },
    compass: {
        filepath: args.options.cciCompass,
        tolerance: 5,
        namedHeadings: {
            "north" : 0,
            "north-east" : 45,
            "east" : 90,
            "south-east" : 135,
            "south" : 180,
            "south-west": 225,
            "west" : 270,
            "north-west" : 315,
        }
    },
    vehicle: {
        filepath: args.options.cciVehicle,
        commands: {
            forward: "fwd",
            backward: "bwd",
            left: "lft",
            right: "rgt",

            stop: "stp",
        }
    },
    timeout_ms: 10 * 1000,
    sleep_us: 10 * 1000,
};

if (!cci.vehicle.filepath || !cci.compass.filepath) {
    throw new Error("Required CCI components (vehicle and compass) are not configured");
}

var fs = require("fs");
var utf8 = "UTF-8";

////////////////////////////////////////////////////////////////////////////////

app.get("/coordinates", function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end(getCoordinates());
});

app.get("/heading", function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end(getHeading());
});

app.post("/turn", function (req, res) {
    var sleep = require("sleep");
    var query = url.parse(req.url, true).query;

    res.writeHead(200, {"Content-Type": "text/plain"});
    if (!query.heading) {
        res.end("Missing heading query param");
        return;
    }

    if (!validator.isNumeric(query.heading) && !validator.isIn(query.heading, Object.keys(cci.compass.namedHeadings))) {
        res.end("Invalid or missing heading query param");
        return;
    }

    var startHeading = getHeading();
    var currentHeading = startHeading;

    var targetHeading = validator.isNumeric(query.heading)
        ? validator.toFloat(query.heading)
        : cci.compass.namedHeadings[query.heading]

    var start = new Date().getTime();

    var delta = Math.abs(currentHeading - targetHeading);
    var command;
    while (delta >= cci.compass.tolerance && new Date().getTime() - start < cci.timeout_ms) {
        if (targetHeading > currentHeading) {
            if (delta <= 180) {
                command = cci.vehicle.commands.right;
            } else {
                command = cci.vehicle.commands.left;
                delta = 360 - delta;
            }
        } else {
            if (delta <= 180) {
                command = cci.vehicle.commands.left;
            } else {
                command = cci.vehicle.commands.right;
                delta = 360 - delta;
            }
        }
        sendEngineCommand(command);
        sleep.usleep(cci.sleep_us);

        delta = Math.abs(getHeading() - targetHeading);
    }
    sendStopCommand();
    res.end();
});

app.post("/move", function (req, res) {
    var query = url.parse(req.url, true).query;

    res.writeHead(200, {"Content-Type": "text/plain"});
    if (query.duration && query.distance) {
        res.end("Only one of distance/duration must be specified");
        return;
    }
    if (query.duration && !validator.isInt(query.duration)) {
        res.end("Invalid duration query param");
        return;
    }
    if (query.distance && !validator.isFloat(query.distance)) {
        res.end("Invalid distance query param");
        return;
    }

    if (query.duration) {
        var duration = validator.toInt(query.duration);
        sendEngineCommand();
        sleep.usleep(duration * 1000);
        sendStopCommand();

        res.end();
        return;
    }

    if (query.distance) {
        var distance = validator.toFloat(query.distance);

        var startCoordinates = getCoordinates();
        var startX = getX(startCoordinates), startY = getY(startCoordinates);

        var distance = validator.toFloat(query.distance);

        var start = new Date().getTime();
        sendEngineCommand();
        do {
            sleep.usleep(cci.sleep_us);
        } while (getDistanceTravelledFrom(startX, startY) < distance && new Date().getTime() - start < cci.timeout_ms);
        sendStopCommand();

        res.end();
        return;
    }

    if (!query.duration && !query.distance) {
        sendEngineCommand();
    }
    res.end();
});

app.post("/move-:command", function(req, res) {
    var query = url.parse(req.url, true).query;

    res.writeHead(200, {"Content-Type": "text/plain"});

    if (!validator.isIn(req.params.command.toLowerCase(), Object.keys(cci.vehicle.commands))) {
        res.end("Invalid command param");
        return;
    }
    var command = cci.vehicle.commands[req.params.command];

    if (query.duration && !validator.isInt(query.duration)) {
        res.end("Invalid duration query param");
        return;
    }
    var duration = validator.toInt(query.duration);

    sendEngineCommand(command);
    sleep.usleep(duration * 1000);
    sendStopCommand();

    res.end();
});

app.post("/stop", function (req, res) {
    sendStopCommand();

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end();
});

app.get("/map", function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    try {
        res.end(map());
    } catch (e) {
        res.end(e);
    }
});

app.post("/checkin", function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end(checkin());
});

////////////////////////////////////////////////////////////////////////////////

function getCoordinates() {
    if (!cci.lps.positioning.filepath) {
        throw new Error("LPS is not configured");
    }
    return fs.readFileSync(cci.lps.positioning.filepath, utf8).replace(/^\s+|\s+$/g, '');
}

function getX(rawCoordinates) {
    return rawCoordinates.split(" ")[0];
}

function getY(rawCoordinates) {
    return rawCoordinates.split(" ")[1];
}

function getHeading() {
    return fs.readFileSync(cci.compass.filepath, utf8).replace(/^\s+|\s+$/g, '');
}

function sendEngineCommand(command) {
    if (!command) {
        command = cci.vehicle.commands.forward;
    }
    fs.writeFileSync(cci.vehicle.filepath, command);
}

function sendStopCommand() {
    sendEngineCommand(cci.vehicle.commands.stop);
}

function map() {
    if (!cci.lps.map.filepath) {
        throw new Error("LSP Map is not configured");
    }
    return fs.readFileSync(cci.lps.map.filepath, "utf-8").replace(/^\s+|\s+$/g, '');
}

function checkin() {
    if (!cci.lps.checkin.filepath) {
        throw new Error("LPS Check-In is not configured");
    }
    return fs.readFileSync(cci.lps.checkin.filepath, utf8).replace(/^\s+|\s+$/g, '');
}

function getDistanceTravelledFrom(startX, startY) {
    var currentCoordinates = getCoordinates();
    var currentX = getX(currentCoordinates), currentY = getY(currentCoordinates);
    return Math.sqrt(
        Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
    );
}
