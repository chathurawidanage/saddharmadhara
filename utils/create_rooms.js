const DHIS2_API_URL = "http://localhost:8080/api";
const authToken = process.env.D2_AUTH;
const requestOptions = {
    headers: new Headers({
        "content-type": "application/json",
        Authorization: "ApiToken " + authToken,
    })
}


const ORG_UNIT = "VfExRWiI0ZJ";

const FLOOT_ATTRIBUTE = "tAqOHVVVy2X";
const LOCATION_ATTRIBUTE = "TuaBW7iXTGw";

const noOfRooms = 4;
const roomCodePrefix = "AGF";


const createRooms = async () => {
    for (let index = 0; index < noOfRooms; index++) {
        let roomCode = roomCodePrefix + (index + 1)

        let response = await fetch(`${DHIS2_API_URL}/options`, {
            ...requestOptions,
            method: "POST",
            body: JSON.stringify({
                "code": roomCode,
                "attributeValues": [
                    {
                        "value": ORG_UNIT,
                        "attribute": { "id": LOCATION_ATTRIBUTE }
                    },
                    {
                        "value": (index + 1),
                        "attribute": { "id": FLOOT_ATTRIBUTE }
                    }
                ],
                "name": roomCode,
                "optionSet": { "id": "ofMFrZQtp9g" }
            })
        });

        if (response.ok) {
            console.log(roomCode, "created");
        } else {
            console.log(roomCode, "failed", await response.json());
        }
    }
};

createRooms();

