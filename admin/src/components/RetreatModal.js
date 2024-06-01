import React from "react";
import {
  OrganisationUnitTree,
  Button,
  Modal,
  ModalActions,
  ModalContent,
  ReactFinalForm,
  ModalTitle,
  ButtonStrip,
  Label,
  hasValue,
  InputFieldFF
} from "@dhis2/ui";
import { Row, Col } from "react-bootstrap";

const { Form, Field } = ReactFinalForm;

const RetreatModel = (props) => {
  return (
    <Form
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ handleSubmit, form, submitting, pristine, values }) => (
        <form onSubmit={handleSubmit}>
          <Modal>
            <ModalTitle>New Retreat</ModalTitle>
            <ModalContent>
              <h6>
                {values.date} {values.location?.displayName}
              </h6>
              <Row>
                <Col>
                  <Field
                    required
                    name="date"
                    label="Date"
                    component={InputFieldFF}
                    type="date"
                    validate={hasValue}
                  />
                </Col>
              </Row>

              <Row>
                <Field
                  name="location"
                  label="Location"
                  validate={hasValue}
                  required
                >
                  {(props) => (
                    <div>
                      <Label required>Location</Label>
                      <OrganisationUnitTree
                        roots="GRcUwrSIcZv"
                        onChange={(e) => {
                          props.input.onChange(e);
                        }}
                        autoExpandLoadingError={true}
                        selected={
                          props.input.value ? [props.input.value.path] : []
                        }
                      />
                    </div>
                  )}
                </Field>
              </Row>
              <Row>
                <Field
                  required
                  name="noOfYogis"
                  label="No of Yogis"
                  component={InputFieldFF}
                  type="number"
                  validate={hasValue}
                />
              </Row>
            </ModalContent>
            <ModalActions>
              <ButtonStrip end>
                <Button
                  onClick={() => {
                    form.reset();
                    props.onCancel();
                  }}
                  disabled={submitting}
                  secondary
                >
                  Cancel
                </Button>
                <Button
                  primary
                  type="submit"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  Create
                </Button>
              </ButtonStrip>
            </ModalActions>
          </Modal>
        </form>
      )}
    </Form>
  );
};

export default RetreatModel;
