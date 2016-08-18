# CCI ScratchX

## CCI ScratchX Helper App Interface 

### Car Info

* `GET /position` 
    Returns current car's coordinates (plain text, comma separated), e.g. `124,543`.
* `GET /compass` 
    Returns direction (degrees counted clockwise from the "relative North"), e.g. `-57`.

### Moving the Car

* `POST /turn/{direction}` 
    Turns the car to head the specified direction (if needed) - `north`, `east`, `south`, `west` or degrees counted clockwise from the "relative North", e.g. `-57`.
    Returns the final compass reading. 
* `POST /move?direction={direction}` 
    Turns (if needed) and moves the car in the specified direction (`forward`, `backwards`, `north`, `east`, `south`, `west`). Default is `forward`.
    Does not return anything (empty body).
* `POST /stop`
    Stops the car.
    Returns the coordinates where it has stopped (plain text, comma separated), e.g. `124,543`.

### Interacting with the Field

* `GET /nfc`
    Returns plain text data from the NFC tag.
