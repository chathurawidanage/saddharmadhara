const fs = require("fs");
const { parse } = require("csv-parse");

const csvPath = process.env.FILE;

const DHIS2_TRACKER_URL = "http://localhost:8080/api/tracker?async=false";
const authToken = process.env.AUTH;

const DHIS2_PROGRAM = "KdYt2OP9VjD";
const DHIS2_ROOT_ORG_UNIT = "GRcUwrSIcZv";
const DHIS2_TRACKED_ENTITY_TYPE = "j5l8gwYkmvg";
const DHIS2_SPECIAL_COMMENT_PROGRAM_STAGE = "owqAYpdS5dr";
const DHIS2_SPECIAL_COMMENT_DATA_ELEMENT = "PH2ygv78F19";

const DHIS2_PRIMARY_ID_ATTRIBUTE = "EDhjneO1ofm";

const yesNoQuestions = new Set([
  "15. Do you have any idea of committing yourself to spiritual life (Ordination)?",
  "22.a) Do you have full permission from your parents/guardian/employer",
  "22.b) Are you free from unmanageable loans",
  "22.c) Are you free from illnesses or deformities from birth",
  "22.d) Is there any addiction to toxications (drugs)? ",
  "22.e) Do you suffer from stress or other such mental problems? ",
  "22.f) Do you have serious legal litigations that are bothering you",
  "22.g) Do you have any signs of diseases like Asthma/Kushta/Vana/cists (Visha gedi)/boils or epilepsy?",
  "22.h) Are there any deformities in the body ",
]);

const agreeDisagreeQuestions = new Set([
  "23.a) You should try to reduce the use of cell phones",
  "23.b) You should try to avoid bad habits like masturbation",
  "23.c) Practice ‘Ashuba Bhavana’ at least two weeks",
  "23.d) Practice compassion (Maithree Bhavana) ",
  "23.e) With the understanding of the virtues of ‘Trivida Rathna’",
  "23.f) Have some Dhamma knowledge about the basic facts",
]);

const genderMap = new Map([
  ["M", "Male"],
  ["F", "Female"],
]);

const maritalStatusMap = new Map([
  ["M", "Married"],
  ["D", "Divorced"],
  ["W", "Widowed"],
  ["U", "Single"],
]);

const yesNoMap = new Map([
  ["Y", true],
  ["N", false],
]);

const agreeDisagreeMap = new Map([
  ["A", true],
  ["D", false],
]);

const specialCommentQuestion = "Special Comments";
const appliedDateField = "Applied Date";
const maritalStatusQuestion = "5. Marital status";
const genderQuestion = "4. Gender";

const idMap = {
  "Record ID": undefined,
  "1. Full name of the applicant": "fvk2p04ylAA",
  "2. Name with initials": "MMb2cXBOrSY",
  "3. Date of birth": "oZkvTN1dcPw",
  "4. Gender": "tuKFO1uF5x5",
  "5. Marital status": "B08mfPKrUiM",
  "6. National identity card number": "W1fmUMMnQdu",
  "7. Passport number": "hv3aLM80Mrn",
  "8. Permanant Address": "ywoMYb2bCz5",
  "9. Mobile": "lLXB9cYYgEP",
  WhatsApp: "CpF36JSasMJ",
  Home: "ZRXiTWo2Vbq",
  "10. Email address": "lByRbJqnG5q",
  "11. Profession": "EDMGB8x9lc3 ",
  "12. Name with initials of the person to be contacted in an emergency.":
    "NgHvHow9RZs",
  "13. Applicant’s relationship to emergency contact person.": "duD6vVqtSCq",
  "14. Phone number of the emergency contact.": "uYHVvgUT65S",
  "15. Do you have any idea of committing yourself to spiritual life (Ordination)?":
    "kT2ExGjYbPS",
  "16. State your objectives for participating in a meditation program":
    "KxFKodUg1kx",
  "17. Do you agree to participate in a meditation program at any center in the country?":
    undefined,
  "18. Please state the nature and dates of involvement in the past":
    "rrXapwmqJ3D",
  "19. If you have any medical conditions or disabilities- please provide information":
    "F2b0gJpgjLp",
  "20. Current treatments are taken for the above ailments and disabilities.":
    "nTi2kp2C0v8",
  "21. Are there any other issues or challenges you are currently facing that we should be aware of?":
    "iGNQ7t4qvcM",
  "22.a) Do you have full permission from your parents/guardian/employer":
    "QGXYhZMXfnc",
  " 22.a) detail": "QOGamVcvLPz",
  "22.b) Are you free from unmanageable loans": undefined,
  " 22.b) detail": undefined,
  "22.c) Are you free from illnesses or deformities from birth": "RpNKpAufHbn",
  " 22.c) detail": "HtW0OMmthFQ",
  "22.d) Is there any addiction to toxications (drugs)? ": "fyV0EfY0dnR",
  " 22.d) detail": "la4960WBUC3",
  "22.e) Do you suffer from stress or other such mental problems? ":
    "dgky5acnvG3",
  " 22.e) detail": "Mp6LLGv4WOT",
  "22.f) Do you have serious legal litigations that are bothering you":
    "g1QmlpA14bX",
  " 22.f) detail": "GL9bAKX2wl3",
  "22.g) Do you have any signs of diseases like Asthma/Kushta/Vana/cists (Visha gedi)/boils or epilepsy?":
    "iaW1GDx6k3P",
  " 22.g) detail": "nOm8SVX2VbC",
  "22.h) Are there any deformities in the body ": "nwItPNW72se",
  " 22.h) detail": "aHZ7BJDzntQ",
  "23.a) You should try to reduce the use of cell phones": "EJaujr9wSTz",
  "23.b) You should try to avoid bad habits like masturbation": "ThRvZed4wxU",
  "23.c) Practice ‘Ashuba Bhavana’ at least two weeks": "DZgJUDEYKvH",
  "23.d) Practice compassion (Maithree Bhavana) ": "ZnRv3kNDmun",
  "23.e) With the understanding of the virtues of ‘Trivida Rathna’":
    "q6N0kD78IS9",
  "23.f) Have some Dhamma knowledge about the basic facts": "wbllYsatR5l",
  "Guardian Name": undefined,
  "Relationship to the applicant": undefined,
  Profession: "EDMGB8x9lc3",
  Age: undefined,
  "Telephone number": undefined,
  Address: undefined,
  "Special comments": "PH2ygv78F19",
  "Applied Date": "25/12/2023",
};

let records = [];

const valueToDate = (value) => {
  //   const dateSplits = value.split("/");
  //   return new Date(dateSplits[2], parseInt(dateSplits[1]) - 1, dateSplits[0]);
  return new Date(value);
};

const tansformRecord = (record) => {
  let newRecord = { ...record };

  // yes no
  for (let yesNoQ of yesNoQuestions) {
    if (yesNoMap.has(newRecord[yesNoQ])) {
      newRecord[yesNoQ] = yesNoMap.get(newRecord[yesNoQ]);
    } else {
      console.log("Unknown yes no", yesNoQ, newRecord[yesNoQ]);
      delete newRecord[yesNoQ];
    }
  }

  // agree disagree
  for (let agQ of agreeDisagreeQuestions) {
    if (agreeDisagreeMap.has(newRecord[agQ])) {
      newRecord[agQ] = agreeDisagreeMap.get(newRecord[agQ]);
    } else {
      console.log("Unknown agree disagree", agQ, newRecord[agQ]);
      delete newRecord[agQ];
    }
  }

  // marital status
  if (maritalStatusMap.has(newRecord[maritalStatusQuestion])) {
    newRecord[maritalStatusQuestion] = maritalStatusMap.get(
      newRecord[maritalStatusQuestion]
    );
  } else {
    console.log("Unknown marital status", newRecord[maritalStatusQuestion]);
  }

  // gender
  if (genderMap.has(newRecord[genderQuestion])) {
    newRecord[genderQuestion] = genderMap.get(newRecord[genderQuestion]);
  } else {
    console.log("Unknonw gender", newRecord[genderQuestion]);
  }

  if (newRecord["6. National identity card number"].length > 3) {
    newRecord[DHIS2_PRIMARY_ID_ATTRIBUTE] =
      newRecord["6. National identity card number"];
  } else if (newRecord["7. Passport number"].length > 3) {
    newRecord[DHIS2_PRIMARY_ID_ATTRIBUTE] = newRecord["7. Passport number"];
  }

  let mappedAttributes = [];

  for (let key of Object.keys(newRecord)) {
    if (idMap[key]) {
      mappedAttributes.push({
        attribute: idMap[key],
        value: newRecord[key].toLocaleString(),
      });
    }
  }

  // set primary id

  return mappedAttributes;
};

const startImport = async () => {
  for (let record of records) {
    let date = valueToDate(record[appliedDateField]);
    delete record[appliedDateField];

    let specialComment = record[specialCommentQuestion];
    delete record[specialCommentQuestion];

    let attributes = tansformRecord(record);
    let events = [];

    if (specialComment && specialComment.length > 5) {
      events.push({
        occurredAt: date,
        programStage: DHIS2_SPECIAL_COMMENT_PROGRAM_STAGE,
        orgUnit: DHIS2_ROOT_ORG_UNIT,
        status: "COMPLETED",
        dataValues: [
          {
            occurredAt: date,
            dataElement: DHIS2_SPECIAL_COMMENT_DATA_ELEMENT,
            value: surveyJsAttributes.SpecialComment,
          },
        ],
      });
    }

    let body = {
      trackedEntities: [
        {
          trackedEntityType: DHIS2_TRACKED_ENTITY_TYPE,
          orgUnit: DHIS2_ROOT_ORG_UNIT,
          attributes,
          enrollments: [
            {
              orgUnit: DHIS2_ROOT_ORG_UNIT,
              program: DHIS2_PROGRAM,
              enrolledAt: date,
              occurredAt: date,
              events,
            },
          ],
        },
      ],
    };

    console.log(JSON.stringify(body));

    let response = await fetch(DHIS2_TRACKER_URL, {
      method: "POST",
      headers: new Headers({
        "content-type": "application/json",
        Authorization: authToken,
      }),
      body: JSON.stringify(body),
    });
    if (response.status !== 201) {
      console.log(await response.json());
      break;
    }
    break;
  }
};

fs.createReadStream(csvPath)
  .pipe(
    parse({ delimiter: ",", from_line: 1, relax_quotes: true, columns: true })
  )
  .on("data", async function (row) {
    records.push(row);
  })
  .on("end", () => {
    console.log("end", records.length, "records");
    startImport();
  });
