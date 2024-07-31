const fs = require("fs");
const util = require('util');

const readline = require('readline');

const DHIS2_API_URL = "http://localhost:8080/api";
const authToken = process.env.D2_AUTH;
const requestOptions = {
    headers: new Headers({
        "content-type": "application/json",
        Authorization: "ApiToken " + authToken,
    })
}

const DHIS2_PROGRAM = "KdYt2OP9VjD";
const DHIS2_TEI_ATTRIBUTE_NIC = "W1fmUMMnQdu";
const DHIS2_TEI_ATTRIBUTE_PASSPORD = "hv3aLM80Mrn";

const rootPath = "../junk";

const findYogi = async (identification) => {

    let resposes = await Promise.all([
        fetch(`${DHIS2_API_URL}/tracker/trackedEntities?program=${DHIS2_PROGRAM}&ouMode=ACCESSIBLE&filter=${DHIS2_TEI_ATTRIBUTE_NIC}:eq:${identification}`,
            requestOptions
        ),
        fetch(`${DHIS2_API_URL}/tracker/trackedEntities?program=${DHIS2_PROGRAM}&ouMode=ACCESSIBLE&filter=${DHIS2_TEI_ATTRIBUTE_PASSPORD}:eq:${identification}`,
            requestOptions
        )
    ]);

    let json = await Promise.all(resposes.filter(r => r.status === 200)
        .map(r => r.json()));

    let found = json.find(body => body.instances.length > 0);

    if (found) {
        return found.instances[0].trackedEntity;
    }
};

const checkState = async (fileName) => {
    console.log("Checking state of ", fileName);
    const lineReader = readline.createInterface({
        input: fs.createReadStream(`${rootPath}/${fileName}`)
    });

    let missing = 0;

    let checks = [];

    for await (const idNumber of lineReader) {
        checks.push(findYogi(idNumber).then(x => {
            if (!x) {
                console.log("missing", idNumber);
                missing++;
            }
        }))
    }

    await Promise.all(checks);

    if (missing === 0) {
        console.log(fileName, "is safe to import!!!");
        return true;
    }
    return false;
};

const markYogiAttended = async (teiId, retreatOptionCode, orgUnitId, retreatDate) => {
    let response = await fetch("https://manager.srisambuddhamission.org/api/events", {
        method: "POST",
        body: JSON.stringify({
            "orgUnit": orgUnitId,
            "program": "KdYt2OP9VjD",
            "programStage": "NYxnKQd6goA",
            "status": "ACTIVE",
            "trackedEntityInstance": teiId,
            "eventDate": retreatDate,
            "dataValues": [
                {
                    "dataElement": "rYqV3VQu7LS",
                    "value": retreatOptionCode,
                    "providedElsewhere": false
                }, {
                    "dataElement": "CzwVwJ30hTj",
                    "value": "attended",
                    "providedElsewhere": false
                }
            ]
        }),
        ...requestOptions
    });

    let json = await response.json();

    if (json.status === "OK") {
        console.log(teiId, "DONE");
    } else {
        console.log(teiId, "FAILED");
    }
};

const markFileAttendance = async (fileName, retreatOptionCode, orgUnitId, retreatDate) => {

    if (!await checkState(fileName)) {
        console.log("Skipping", fileName, "due to invalid state");
        return;
    }

    console.log("Processing", fileName);
    const lineReader = readline.createInterface({
        input: fs.createReadStream(`${rootPath}/${fileName}`)
    });

    let missing = 0;

    let checks = [];

    for await (const idNumber of lineReader) {
        let teiId = await findYogi(idNumber);
        await markYogiAttended(teiId, retreatOptionCode, orgUnitId, retreatDate);
    }
};

// fs.readdir(rootPath, async (err, files) => {
//     for (let index = 0; index < files.length; index++) {
//         await checkState(files[index]);
//     }
// });

// markFileAttendance("../junk/5GS1.txt", "Nov 9 2023 Attanagalle", "VfExRWiI0ZJ", "2023-11-09");
// markFileAttendance("../junk/5GS2.txt", "Nov 17 2023 Attanagalle", "VfExRWiI0ZJ", "2023-11-17");
// markFileAttendance("../junk/5GS3.txt", "Nov 25 2023 Attanagalle", "VfExRWiI0ZJ", "2023-11-25");
// markFileAttendance("../junk/5GS4.txt", "Dec 15 2023 Attanagalle", "VfExRWiI0ZJ", "2023-12-15");
// markFileAttendance("../junk/5GS5.txt", "Dec 22 2023 Attanagalle", "VfExRWiI0ZJ", "2023-12-22");
// markFileAttendance("../junk/5GS6.txt", "Jan 3 2024 Attanagalle", "VfExRWiI0ZJ", "2024-01-03");
// markFileAttendance("../junk/5GS7.txt", "Jan 11 2024 Attanagalle", "VfExRWiI0ZJ", "2024-01-11");
// markFileAttendance("../junk/5GS8.txt", "Mar 28 2024 Attanagalle", "VfExRWiI0ZJ", "2024-03-28");
// markFileAttendance("../junk/5GS9.txt", "Apr 5 2024 Colombo", "DDfFvmtZQeb", "2024-04-05");
// markFileAttendance("../junk/10GE1.txt", "Mar 15 2024 Attanagalle", "VfExRWiI0ZJ", "2024-03-15");
// markFileAttendance("../junk/10GS1.txt", "Oct 27 2023 Attanagalle", "VfExRWiI0ZJ", "2023-10-27");
// markFileAttendance("../junk/10GS2.txt", "Dec 2 2023 Attanagalle", "VfExRWiI0ZJ", "2023-12-02");

// markYogiAttended("MR6scBzLbgI", "Dec 15 2023 Attanagalle", "VfExRWiI0ZJ", "2024-01-01");








