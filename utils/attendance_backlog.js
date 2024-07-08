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

const readFile = async (fileName) => {
    console.log("Processing", fileName);
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
    }
    console.log("");
};

fs.readdir(rootPath, async (err, files) => {
    for (let index = 0; index < files.length; index++) {
        await readFile(files[index]);
    }
});






