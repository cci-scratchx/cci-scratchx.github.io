# CCI ScratchX

##  Prerequisites

* Running [CCI](https://gitlab.emea.irdeto.com/iaa-hackathon/irdeto-cci)
* [Node.js](https://nodejs.org/en/download/current/)

## Use ScratchX Extension

### Build And Run ScratchX locally
 
See https://github.com/LLK/scratchx 

### Make Extension Available

Run the simple web server to serve the Scratch extension file:

```
cd scratchx
npm install http-server -g
http-server -p 8080
```

### Run ScratchX

When both ScratchX and the extension file server are running (e.g. on `localhost`) load ScratchX with the extension:

http://localhost:8000/?url=http://localhost:8080/cci.js

## Build And Run on The Car with CCI 

```
cd helper-app
npm install npm -g
npm install
```

Make sure CCI is running. Then run the helper app:

```
npm start -p 8888 -l /tmp/cci/lps -v /tmp/cci/vehicle -c /tmp/cci/compass -m /tmp/cci/map -x /tmp/cci/checkin
```

(assuming CCI is using `/tmp/cci` directory)

### Options

* `--port|-p`       - port for the web server to listen to (default is `8888`)
* `--cciLPS|-l`     - filepath of CCI LPS 
* `--cciCompass|-c` - filepath of CCI Compass 
* `--cciVehicle|-v` - filepath of CCI Vehicle 
* `--cciMap|-m`     - filepath of CCI Current Map 
* `--cciCheckin|-x` - filepath for CCI Check-in

## CCI ScratchX Helper App Interface 

### Getting Car Info

* `GET /coordinates` 
    Returns current car's coordinates (plain text, space separated), e.g. `124 543`.
    
* `GET /heading` 
    Returns car's heading (values from 0 to 360), e.g. `57`.

### Moving the Car

* `POST /turn?heading={heading}` 
    Turns the car to head the specified direction (if needed) - `north`, `east`, `south`, `west` or the numeric heading (values from 0 to 360), e.g. `57`.
    Does not return anything (empty body). 
    
* `POST /move?duration={duration}&distance={distance}` 
    Moves the car in the current direction for the specified duration (in ms) or for the specified distance (or until stopped using `GET /stop` when neither duration or distance is specified) .
    Does not return anything (empty body).
    
* `POST /stop`
    Stops the car.
    Does not return anything (empty body).
