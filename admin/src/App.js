import React from "react";
import { DataQuery } from "@dhis2/app-runtime";
import classes from "./App.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Card, Row, Button, Col } from "react-bootstrap";

const query = {
  retreats: {
    resource: "optionSets/ys2Pv9hTS0O.json",
    params: {
      fields: "options[id,name,attributeValues]",
    },
  },
};

const Retreat = (props) => {
  console.log(props.retreat);
  return (
    <Col md={3}>
      <Card>
        <Card.Img
          variant="top"
          src="https://www.thingstodosrilanka.com/wp-content/uploads/2020/08/ruwanweliseya-anuradhapura.jpg"
        />
        <Card.Body>
          <Card.Title>{props.retreat.name}</Card.Title>
          <Card.Text>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </Card.Text>
          <Button variant="primary">Go somewhere</Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

const MyApp = () => (
  <Container>
    <DataQuery query={query}>
      {({ error, loading, data }) => {
        if (error) return <span>ERROR</span>;
        if (loading) return <span>...</span>;

        return (
          <Row>
            {data.retreats.options.map((retreat) => {
              return <Retreat retreat={retreat} />;
            })}
          </Row>
        );
      }}
    </DataQuery>
  </Container>
);

export default MyApp;
