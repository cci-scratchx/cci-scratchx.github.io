# CCI ScratchX

> Temporarily the ScratchX extension is available in [this github.io repo](https://github.com/mikhail-irdeto/mikhail-irdeto.github.io) (for now ScratchX only allows to hotlink extensions from github.io). 
> Has to be moved to a proper namespace by the time of the Hackathon.
>
> [Try it out now!](http://scratchx.org/?url=https://mikhail-irdeto.github.io/cci.js)

##  Prerequisites

* Running [CCI](https://gitlab.emea.irdeto.com/iaa-hackathon/irdeto-cci)
* [Node.js](https://nodejs.org/en/download/current/)

## Build

```
cd helper-app
npm install -g npm
npm install
```

## Run

```
cd helper-app
node index.js -p 8080 -l /tmp/cci/lps -e /tmp/cci/engine -c /tmp/cci/compass -n /tmp/cci/nfc
```

### Options

* `--port|-p` - Defines the port for the web server to listen to
* `--cciLPS|-l` - Defines the CCI LPS filepath
* `--cciCompass|-c` - Defines the CCI Compass filepath
* `--cciEngine|-e` - Defines the CCI Engine filepath
* `--cciNFC|-n` - Defines the CCI NFC filepath

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

### Interacting with the "Field"

* `GET /nfc`
    Returns plain text (?) data from the NFC tag.
