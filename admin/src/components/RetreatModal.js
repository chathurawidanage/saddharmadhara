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
  NoticeBox
} from "@dhis2/ui";
import { Row, Col } from "react-bootstrap";
import {
  DHIS2_RETREAT_CODE,
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
  }
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
    }
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
          {
            attribute: { id: DHIS2_RETREAT_CODE },
            value: values.code,
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
              <div style={styles.fieldRow}>
                <h6>{`${values.date} ${values.location?.displayName}`}</h6>
              </div>
              <div style={styles.fieldRow}>
                <Field
                  required
                  name="code"
                  label="Code"
                  placeholder="5GS1"
                  component={InputFieldFF}
                  type="text"
                  validate={hasValue}
                />

              </div>
              <div style={styles.fieldRow}>

                <Field
                  required
                  name="date"
                  label="Date"
                  component={InputFieldFF}
                  type="date"
                  validate={hasValue}
                />

              </div>
              <div style={styles.fieldRow}>

                <Field
                  required
                  name="noOfDays"
                  label="No of Days"
                  component={InputFieldFF}
                  type="number"
                  validate={hasValue}
                />

              </div>
              <div style={styles.fieldRow}>

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

              </div>
              <div style={styles.fieldRow}>

                <Field
                  required
                  name="noOfYogis"
                  label="No of Yogis"
                  component={InputFieldFF}
                  type="number"
                  validate={hasValue}
                />

              </div>
              <div style={styles.fieldRow}>

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

              </div>
              <div style={styles.fieldRow}>
                {errorMutate &&
                  <NoticeBox error title="Retreat creation failed">
                    {errorMutate?.details?.response?.errorReports?.map(report => report.message).join(",")}
                  </NoticeBox>
                }
              </div>
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
                  disabled={submitting || loadingMutate}
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
