const DHIS2_API_URL = 'https://manager.srisambuddhamission.org/api';
const authToken = process.env.D2_AUTH;
const requestOptions = {
  headers: new Headers({
    'content-type': 'application/json',
    Authorization: 'ApiToken ' + authToken,
  }),
};

const DHIS2_PROGRAM = 'KdYt2OP9VjD';
const DHIS2_TEI_ATTRIBUTE_NIC = 'W1fmUMMnQdu';
const DHIS2_TEI_ATTRIBUTE_PASSPORT = 'hv3aLM80Mrn';
const DHIS2_PROGRAM_STAGE_ATTENDANCE = 'NYxnKQd6goA';
const DHIS2_PROGRAM_STAGE_EXPRESSION_OF_INTEREST = 'BLn1j2VgLZf';

async function getTeiIds() {
  let response = await fetch(`${DHIS2_API_URL}/trackedEntityInstances.json?ouMode=ACCESSIBLE&program=${DHIS2_PROGRAM}&fields=trackedEntityInstance&skipPaging=true`, requestOptions);
  let json = await response.json();
  return json.trackedEntityInstances.map(tei => tei.trackedEntityInstance);
}

async function getEventsForTei(teiId) {
  let response = await fetch(`${DHIS2_API_URL}/events.json?ouMode=ACCESSIBLE&program=${DHIS2_PROGRAM}&trackedEntityInstance=${teiId}&skipPaging=true`, requestOptions);
  let json = await response.json();
  return json.events;
}

async function getRetreatToDateMap() {
  let response = await fetch(`${DHIS2_API_URL}/optionSets/ys2Pv9hTS0O.json?fields=options[code,%20attributeValues]`, requestOptions);
  let json = await response.json();
  return json.options.reduce((map, option) => {
    map[option.code] = option.attributeValues.find(av => av.attribute.id === 'sCzsZZ7m37E').value;
    return map;
  }, {});
}

async function processTei(teiId, retreatDateMap) {
  console.log('Processing', teiId);
  let events = await getEventsForTei(teiId);
  let attendanceEvent = events.filter(e => e.programStage === DHIS2_PROGRAM_STAGE_ATTENDANCE);
  let eoiEvent = events.filter(e => e.programStage === DHIS2_PROGRAM_STAGE_EXPRESSION_OF_INTEREST);
  let eoiRetreatSet;
  try {
    eoiRetreatSet = eoiEvent.map(e => e.dataValues.find(dv => dv.dataElement === 'rYqV3VQu7LS').value);
  } catch (e) {
    console.log('Error in processing', teiId);
    throw e;
  }
  // console.log(attendanceEvent.length, eoiEvent.length);
  for (let attendance of attendanceEvent) {
    let attendanceRetreatCode;
    try {
      attendanceRetreatCode = attendance.dataValues.find(dv => dv.dataElement === 'rYqV3VQu7LS').value;
    } catch (e) {
      console.log('Error in processing', teiId);
      throw e;
    }
    if (!eoiRetreatSet.includes(attendanceRetreatCode)) {
      console.log(teiId, 'is missing', attendanceRetreatCode);
      const retreatDate = retreatDateMap[attendanceRetreatCode];
      if (!retreatDate) {
        throw new Error(`Couldn't find retreat date for ${attendanceRetreatCode}`);
      }

      const expressionOfInterestResponse = await postEvent(teiId, 'VfExRWiI0ZJ', DHIS2_PROGRAM_STAGE_EXPRESSION_OF_INTEREST,
        retreatDate, [
          {
            'dataElement': 'rYqV3VQu7LS',
            'value': attendanceRetreatCode,
            'providedElsewhere': false,
          }, {
            'dataElement': 'MVaziT78i7p',
            'value': 'selected',
            'providedElsewhere': false,
          },
        ],
      );

      if (expressionOfInterestResponse !== 'OK') {
        throw new Error(`Couldn't create expression of interest for ${teiId}`);
      } else {
        console.log('Created expression of interest for', teiId);
      }
    } else {
      console.log(teiId, 'OK');
    }
  }
}


async function run() {
  const teiIds = await getTeiIds();
  const retreatDateMap = await getRetreatToDateMap();
  console.log('Processing', teiIds.length, 'TEIs');
  let currentBatch = [];
  for (let teiId of teiIds) {
    if (currentBatch.length < 50) {
      currentBatch.push(teiId);
    } else {
      await Promise.all(currentBatch.map(teiId => processTei(teiId, retreatDateMap)));
      currentBatch = [];
    }
  }
  await Promise.all(currentBatch.map(teiId => processTei(teiId, retreatDateMap)));
}

const postEvent = async (teiId, orgUnitId, programStage, eventDate, dataValues) => {
  let response = await fetch('https://manager.srisambuddhamission.org/api/events', {
    method: 'POST',
    body: JSON.stringify({
      'orgUnit': orgUnitId,
      'program': 'KdYt2OP9VjD',
      'programStage': programStage,
      'status': 'ACTIVE',
      'trackedEntityInstance': teiId,
      'eventDate': eventDate,
      'dataValues': dataValues,
    }),
    ...requestOptions,
  });

  let json = await response.json();

  return json.status;
};

run();
