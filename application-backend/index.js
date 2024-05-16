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

/**
 * This endpoint submits a request to the DHIS2 optionSets endpoint,
 * filtering out options with dates in the past or undefined.
 */
app.get("/api/retreats", (req, res) => {
  let optionSet = req.query.optionSet;
  let dateAttribute = req.query.dateAttribute;
  if (!optionSet || !dateAttribute) {
    return res.status(400).send("optionSet and dataAttribute are required");
  }

  let optionSetUrl = new URL("optionSets/" + optionSet, dhis2Endpoint);
  optionSetUrl.searchParams.set("fields", "options[code,name,attributeValues]");
  fetch(optionSetUrl, {
    method: "GET",
    headers: {
      Authorization: dhis2Token,
    },
  })
    .then((res) => res.json())
    .then((jsonResponse) => {
      let mappedOptions = jsonResponse?.options
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
          let retreatDate = option.attributes[dateAttribute];
          return retreatDate && new Date(retreatDate).getTime() > Date.now();
        });
      res.send({
        retreats: mappedOptions,
      });
    })
    .catch((e) => {
      console.error("Error in processing retreats request", e);
      res.status(500).send("");
    });
});

app.get("/api/checkExists", (req, res) => {
  let program = req.query.program;
  let attribute = req.query.attribute;
  let value = req.query.value;
  if (!program || !attribute || !value) {
    return res.status(400).send("program, attribute and value are required");
  }

  let url = new URL("trackedEntityInstances.json", dhis2Endpoint);
  url.searchParams.set("fields", "enrollments[enrollment]");
  url.searchParams.set("programStatus", "ACTIVE");
  url.searchParams.set("program", program);
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

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
