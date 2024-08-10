
const fs = require("fs");
const readline = require('readline');
const lankaNic = require('lanka-nic-2019');


checkInvalid = async () => {

    let newFormatToWhatWeGotMap = new Map();

    let invalidNics = [];
    let duplicates = [];

    const lineReader = readline.createInterface({
        input: fs.createReadStream(`../junk/nics.txt`)
    });

    for await (const idNumber of lineReader) {
        let info = lankaNic.infoNic(idNumber);
        if (!info.isValidated) {
            invalidNics.push(idNumber);
        } else {
            if (newFormatToWhatWeGotMap.has(info.newFormat)) {
                duplicates.push([idNumber, newFormatToWhatWeGotMap.get(info.newFormat)]);
            } else {
                newFormatToWhatWeGotMap.set(info.newFormat, idNumber);
            }
        }
        // console.log(info);
    }

    console.log("Invalid NICs", invalidNics);
    console.log("Duplicate NICs", duplicates);
}

checkInvalid();
