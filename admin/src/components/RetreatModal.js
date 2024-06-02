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
  CircularLoader,
  SingleSelectFieldFF,
} from "@dhis2/ui";
import { Row, Col } from "react-bootstrap";
import {
  DHIS2_RETREAT_DATE_ATTRIBUTE,
  DHIS2_RETREAT_DISABLED_ATTRIBUTE,
  DHIS2_RETREAT_LOCATION_ATTRIBUTE,
  DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE,
  DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE,
  DHIS2_RETREAT_TYPE_ATTRIBUTE,
  DHIS_RETREATS_OPTION_SET_ID,
  DHIS_RETREAT_TYPE_OPTION_SET_ID,
} from "../dhis2";
import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";

const { Form, Field } = ReactFinalForm;

const styles = {
  fieldRow: {
    marginBottom: 10,
  },
};

const retreatModelQuery = {
  retreatTypes: {
    resource: `optionSets/${DHIS_RETREAT_TYPE_OPTION_SET_ID}.json`,
    params: {
      fields: "options[name,code]",
    },
  },
};

const optionMutation = {
  resource: "options",
  data: ({ code, name, attributeValues }) => ({
    code,
    name,
    optionSet: { id: DHIS_RETREATS_OPTION_SET_ID },
    attributeValues,
  }),
  type: "create",
};

const RetreatModel = (props) => {
  const {
    loading: loadingData,
    error: errorLoadingData,
    data,
  } = useDataQuery(retreatModelQuery);

  const [
    mutate,
    { called: calledMutate, loading: loadingMutate, error: errorMutate },
  ] = useDataMutation(optionMutation, {
    onComplete: () => {
      props.onCancel();
    },
  });

  if (errorLoadingData) return <span>ERROR</span>;
  if (loadingData) return <CircularLoader extrasmall />;

  return (
    <Form
      onSubmit={(values) => {
        const attributeValues = [
          {
            attribute: { id: DHIS2_RETREAT_DATE_ATTRIBUTE },
            value: values.date,
          },
          {
            attribute: { id: DHIS2_RETREAT_LOCATION_ATTRIBUTE },
            value: values.location.id,
          },
          {
            attribute: { id: DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE },
            value: values.noOfDays,
          },
          {
            attribute: { id: DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE },
            value: values.noOfYogis,
          },
          {
            attribute: { id: DHIS2_RETREAT_TYPE_ATTRIBUTE },
            value: values.retreatType,
          },
          {
            attribute: { id: DHIS2_RETREAT_DISABLED_ATTRIBUTE },
            value: false,
          },
        ];

        let code = `${new Date(values.date)
          .toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          .replace(",", "")} ${values.location?.displayName}`;

        mutate({ name: code, code, attributeValues });
      }}
    >
      {({ handleSubmit, form, submitting, values }) => (
        <form>
          <Modal>
            <ModalTitle>New Retreat</ModalTitle>
            <ModalContent>
              <Row style={styles.fieldRow}>
                <Col>
                  <h6>{`${values.date} ${values.location?.displayName}`}</h6>
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
              <Row style={styles.fieldRow}>
                <Field
                  required
                  name="retreatType"
                  label="Retreat Type"
                  component={SingleSelectFieldFF}
                  validate={hasValue}
                  options={data.retreatTypes.options.map((option) => {
                    return {
                      label: option.name,
                      value: option.code,
                    };
                  })}
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
                  loading={submitting || loadingMutate}
                  disabled={submitting || loadingMutate || calledMutate}
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
