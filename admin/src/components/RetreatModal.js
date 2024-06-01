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
  InputFieldFF,
} from "@dhis2/ui";
import { Row, Col } from "react-bootstrap";

const { Form, Field } = ReactFinalForm;

const styles = {
  fieldRow: {
    marginBottom: 10,
  },
};

const RetreatModel = (props) => {
  return (
    <Form
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ handleSubmit, form, submitting, values }) => (
        <form>
          <Modal>
            <ModalTitle>New Retreat</ModalTitle>
            <ModalContent>
              <Row style={styles.fieldRow}>
                <Col>
                  <h6>{`${values.date} ${values.location?.displayName} ${values.noOfDays} Days`}</h6>
                </Col>
              </Row>
              <Row style={styles.fieldRow}>
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
              <Row style={styles.fieldRow}>
                <Field
                  required
                  name="noOfDays"
                  label="No of Days"
                  component={InputFieldFF}
                  type="number"
                  validate={hasValue}
                />
              </Row>
              <Row style={styles.fieldRow}>
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
              <Row style={styles.fieldRow}>
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
                  loading={submitting}
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
