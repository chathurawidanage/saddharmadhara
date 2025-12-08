const lankaNic = require("lanka-nic-2019");
const moment = require("moment");

const DHIS2_HOST = "https://manager.srisambuddhamission.org";
const authToken = process.env.D2_AUTH;
const requestOptions = {
  headers: new Headers({
    "content-type": "application/json",
    Authorization: "ApiToken " + authToken,
  }),
};

const DHIS2_TEI_ATTRIBUTE_NIC = "W1fmUMMnQdu";
const DHIS2_TEI_ATTRIBUTE_DOB = "oZkvTN1dcPw";
const DHIS2_TEI_ATTRIBUTE_FULL_NAME = "fvk2p04ylAA";
const DHIS2_PROGRAM = "KdYt2OP9VjD";

const nicDobCheck = (nic, dob) => {
  const nicDate = moment(new Date(lankaNic.infoNic(nic).birthday));
  const dobDate = moment(dob);
  return nicDate.isSame(dobDate, "day");
};

(async () => {
  let page = 1;
  while (true) {
    let url = new URL(
      `/api/tracker/trackedEntities.json?program=${DHIS2_PROGRAM}&ouMode=ACCESSIBLE&fields=attributes&page=${page}`,
      DHIS2_HOST,
    );
    let response = await fetch(url, {
      ...requestOptions,
      method: "GET",
    });
    response = await response.json();
    if (response.instances.length === 0) {
      break;
    }
    for (let i = 0; i < response.instances.length; i++) {
      let tei = response.instances[i];
      let nic = tei.attributes.find(
        (attr) => attr.attribute === DHIS2_TEI_ATTRIBUTE_NIC,
      );
      let dob = tei.attributes.find(
        (attr) => attr.attribute === DHIS2_TEI_ATTRIBUTE_DOB,
      );
      if (nic && dob) {
        if (!nicDobCheck(nic.value, dob.value)) {
          console.log(
            [
              nic.value,
              dob.value,
              tei.attributes.find(
                (attr) => attr.attribute === DHIS2_TEI_ATTRIBUTE_FULL_NAME,
              ).value,
            ].join(","),
          );
        }
      }
    }
    page++;
  }
})();
