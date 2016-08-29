var args = require("argv").option([
    {
        name: "port",
        short: "p",
        type: "int",
        description: "Defines the port for the web server to listen to"
    },
    {
        name: "cciLPS",
        short: "l",
        type: "path",
        description: "Defines the CCI LPS filepath",
    },
    {
        name: "cciCompass",
        short: "c",
        type: "path",
        description: "Defines the CCI Compass filepath"
    },
    {
        name: "cciEngine",
        short: "e",
        type: "path",
        description: "Defines the CCI Engine filepath"
    },
    {
        name: "cciNFC",
        short: "n",
        type: "path",
        description: "Defines the CCI NFC filepath"
    }
]).run();

////////////////////////////////////////////////////////////////////////////////

var express = require("express"), url = require("url")
    app = express(),
    server = require("http").createServer(app);
server.listen(args.options.port ? args.options.port : 8888);

process.on("uncaughtException", function(err) {
    console.log(err);
});

var validator = require("validator");

////////////////////////////////////////////////////////////////////////////////

app.get("/", function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hey! Ho! Let\"s Go!");
});

////////////////////////////////////////////////////////////////////////////////

var cci = {
    sleepInterval: 100 * 1000,
    lps: {
        filepath: args.options.cciLPS
    },
    compass: {
        filepath: args.options.cciCompass,
        tolerance: 5,
        namedHeadings: {
            north : 0,
            east: 90,
            south: 180,
            west : 270,
        }
    },
    engine: {
        filepath: args.options.cciEngine,
        commands: {
            forward: "fwd",
            stop: "stp",
            left: "lft",
            right: "rgt",
        }
    },
    nfc: {
        filepath: args.options.cciNFC
    },
};
if (!cci.engine || !cci.compass || !cci.nfc) {
    throw new Error("CCI interface is not set up completely");
}
var fs = require("fs");

////////////////////////////////////////////////////////////////////////////////

var utf8 = "UTF-8";

app.get("/coordinates", function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end(
        fs.readFileSync(cci.lps.filepath, utf8)
    );
});

app.get("/heading", function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end(
        fs.readFileSync(cci.compass.filepath, utf8)
    );
});

app.post("/turn", function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});

    var sleep = require("sleep");

    var query = url.parse(req.url, true).query;

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
        ? validator.toFloat(query.heading) % 360
        : cci.compass.namedHeadings[query.heading]

    do {
        sendEngineCommand(
            (targetHeading - currentHeading) > 180 || (targetHeading - currentHeading) < 0
                ? cci.engine.commands.right
                : cci.engine.commands.left
        );
        sleep.usleep(cci.sleepInterval);
        currentHeading = getHeading();
    } while (Math.abs(currentHeading - targetHeading) > cci.compass.tolerance);

    res.end();
});

app.post("/move", function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});

    var sleep = require("sleep");

    var query = url.parse(req.url, true).query;

    if ((query.duration && query.distance) || (!query.distance && !query.duration)) {
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

        sendEngineCommand();
        do {
            sleep.usleep(cci.sleepInterval);
        } while (getDistanceTravelledFrom(startX, startY) < distance);
        sendStopCommand();

        res.end();
        return;
    }
});

app.post("/stop", function (req, res) {
    sendStopCommand();

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end();
});

app.get("/nfc", function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end(
        fs.readFileSync(cci.nfc, utf8)
    );
});

////////////////////////////////////////////////////////////////////////////////

function getCoordinates() {
    return fs.readFileSync(cci.lps.filepath, utf8)
}

function getX(rawCoordinates) {
    return rawCoordinates.split(" ")[0];
}

function getY() {
    return rawCoordinates.split(" ")[1];
}

function getHeading() {
    return fs.readFileSync(cci.compass.filepath, utf8)
}

function sendEngineCommand(command) {
    if (!command) {
        command = cci.engine.commands.forward;
    }

    console.log(command);

    fs.writeFileSync(cci.engine.filepath, command);
}

function sendStopCommand() {
    sendEngineCommand(cci.engine.commands.stop);
}

function getDistanceTravelledFrom(startX, startY) {
    var currentCoordinates = getCoordinates();
    var currentX = getX(currentCoordinates), currentY = getY(currentCoordinates);
    return Math.sqrt(
        Math.pow(currentX - startX, 2) + Math.pow(currentY - startY)
    );
}
