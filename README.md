# CCI ScratchX

## CCI ScratchX Helper App Interface 

### Car Info

* `GET /coordinates` 
    Returns current car's coordinates (plain text, comma separated), e.g. `124,543`.
* `GET /heading` 
    Returns car's heading, e.g. `-57`.

### Moving the Car

* `POST /turn/{direction}` 
    Turns the car to head the specified direction (if needed) - `north`, `east`, `south`, `west` or the numeric heading, e.g. `-57`.
    Does not return anything (empty body). 
* `POST /move?distance={distance}` 
    Moves the car in the current direction for the specified distance or until stopped when distance is not specified. 
    Does not return anything (empty body).
* `POST /stop`
    Stops the car.
    Does not return anything (empty body).

### Interacting with the Field

* `GET /nfc`
    Returns plain text (?) data from the NFC tag.
