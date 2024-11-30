const express = require("express");
const cors = require("cors");
const config = require("config");
const httpProxy = require("http-proxy");

const app = express();
const port = config.get("port");

app.use(
    cors({
        origin: config.get("cors.origin"),
    })
);

const dhis2Endpoint = config.get("dhis2.endpoint");
const dhis2Token = "ApiToken " + config.get("dhis2.token");

const DHIS2_PROGRAM = "KdYt2OP9VjD";

const DHIS2_RETREATS_OPTION_SET = "ys2Pv9hTS0O";
const DHIS2_RETREAT_DATE_ATTRIBUTE = "sCzsZZ7m37E";
const DHIS2_RETREAT_DISABLED_ATTRIBUTE = "hp92k6RhLJS";

const DHIS2_EXPRESSION_OF_INTERESET_PROGRAM_STAGE = "BLn1j2VgLZf";
const DHIS2_PARTICIPATION_PROGRAM_STAGE = "NYxnKQd6goA";
const DHIS2_RETREAT_DATA_ELEMENT = "rYqV3VQu7LS";

const proxy = httpProxy.createProxyServer({});
proxy.on("proxyReq", (proxyReq, req, res, options) => {
    proxyReq.setHeader("Authorization", dhis2Token);
});

/**
 * Proxies to dhis2 fileResources, but express file limit above will be
 * applied.
 */
app.post("/api/fileResources", (req, res) => {
    proxy.web(req, res, {
        target: new URL("fileResources", dhis2Endpoint),
    });
});

app.post("/api/tracker", (req, res) => {
    proxy.web(req, res, {
        target: new URL("tracker", dhis2Endpoint),
    });
});

const getRetreatEngagement = async (enrollment) => {
    let retreatEngagement = {
        [DHIS2_EXPRESSION_OF_INTERESET_PROGRAM_STAGE]: new Set(),
        [DHIS2_PARTICIPATION_PROGRAM_STAGE]: new Set(),
    };

    if (enrollment === undefined) {
        return retreatEngagement;
    }
    let eventsUrl = new URL("tracker/enrollments/" + enrollment, dhis2Endpoint);
    eventsUrl.searchParams.set(
        "fields",
        "events[programStage,dataValues[dataElement,value]]"
    );
    let enrollmentsResponse = await fetch(eventsUrl, {
        method: "GET",
        headers: {
            Authorization: dhis2Token,
        },
    }).then((res) => res.json());

    enrollmentsResponse?.events.forEach((event) => {
        if (
            event.programStage === DHIS2_EXPRESSION_OF_INTERESET_PROGRAM_STAGE ||
            event.programStage === DHIS2_PARTICIPATION_PROGRAM_STAGE
        ) {
            let engagedRetreat = event.dataValues.find(
                (e) => e.dataElement === DHIS2_RETREAT_DATA_ELEMENT
            )?.value;
            if (engagedRetreat) {
                retreatEngagement[event.programStage].add(engagedRetreat);
            }
        }
    });
    return retreatEngagement;
};

app.get("/api/dataStore/applications", async (req, res) => {
    let dataStoreUrl = new URL(
        "dataStore/saddharmadhara/applications",
        dhis2Endpoint
    );
    try {
        return await fetch(dataStoreUrl, {
            method: "GET",
            headers: {
                Authorization: dhis2Token,
            },
        }).then((res) => res.json());
    } catch (e) {
        // assume defaults
        return {
            accepting: true,
        }
    }
});

/**
 * This endpoint submits a request to the DHIS2 optionSets endpoint,
 * filtering out options with dates in the past or undefined.
 */
app.get("/api/retreats", async (req, res) => {
    let enrollment = req.query.enrollment;
    let optionSetUrl = new URL(
        "optionSets/" + DHIS2_RETREATS_OPTION_SET,
        dhis2Endpoint
    );
    optionSetUrl.searchParams.set("fields", "options[code,name,attributeValues]");
    let optionsResponse = await fetch(optionSetUrl, {
        method: "GET",
        headers: {
            Authorization: dhis2Token,
        },
    }).then((res) => res.json());

    let retreatEngagement = await getRetreatEngagement(enrollment);

    let mappedOptions = optionsResponse?.options
        ?.map((option) => {
            return {
                value: option?.code,
                text: option?.name,
                attributes: option?.attributeValues?.reduce((map, elem) => {
                    map[elem.attribute.id] = elem.value;
                    return map;
                }, {}),
            };
        })
        .filter((option) => {
            let retreatDisabled = option.attributes[DHIS2_RETREAT_DISABLED_ATTRIBUTE];
            return retreatDisabled !== "true";
        })
        .filter((option) => {
            let retreatDate = option.attributes[DHIS2_RETREAT_DATE_ATTRIBUTE];
            return retreatDate && new Date(retreatDate).getTime() > Date.now();
        })
        .filter((option) => {
            return (
                !retreatEngagement[DHIS2_EXPRESSION_OF_INTERESET_PROGRAM_STAGE].has(
                    option.value
                ) &&
                !retreatEngagement[DHIS2_PARTICIPATION_PROGRAM_STAGE].has(option.code)
            );
        });

    res.send({
        retreats: mappedOptions,
    });
});

app.get("/api/checkExists", (req, res) => {
    let attribute = req.query.attribute;
    let value = req.query.value;
    if (!attribute || !value) {
        return res.status(400).send("program, attribute and value are required");
    }

    let url = new URL("trackedEntityInstances.json", dhis2Endpoint);
    url.searchParams.set("fields", "enrollments[enrollment]");
    url.searchParams.set("programStatus", "ACTIVE");
    url.searchParams.set("program", DHIS2_PROGRAM);
    url.searchParams.set("ouMode", "ACCESSIBLE");
    url.searchParams.set("filter", attribute + ":eq:" + value);

    fetch(url, {
        method: "GET",
        headers: {
            Authorization: dhis2Token,
        },
    })
        .then((res) => res.json())
        .then((responseJson) => {
            if (
                responseJson?.trackedEntityInstances?.[0]?.enrollments?.[0]
                    ?.enrollment !== undefined
            ) {
                res.send({
                    enrollment:
                    responseJson.trackedEntityInstances[0].enrollments[0].enrollment,
                });
            } else {
                res.status(404).send();
            }
        })
        .catch((e) => {
            console.error("error in processing checkExists call", e);
            res.status(500).send();
        });
});

app.get("/health", (req, res) => {
    res.send("OK");
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
