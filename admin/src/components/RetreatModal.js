import { useDataMutation } from "@dhis2/app-runtime";
import {
  Button,
  ButtonStrip,
  InputFieldFF,
  Label,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  NoticeBox,
  OrganisationUnitTree,
  ReactFinalForm,
  SingleSelectFieldFF,
  hasValue,
  SwitchFieldFF,
} from "@dhis2/ui";
import React from "react";
import {
  DHIS2_RETREAT_ATTRIBUTE_ACCOMMODATION_NOT_PROVIDED,
  DHIS2_RETREAT_ATTRIBUTE_ACCOMMODATION_OPTIONAL,
  DHIS2_RETREAT_ATTRIBUTE_PRIVATE,
  DHIS2_RETREAT_CLERGY_ONLY_ATTRIBUTE,
  DHIS2_RETREAT_CODE_ATTRIBUTE,
  DHIS2_RETREAT_DATE_ATTRIBUTE,
  DHIS2_RETREAT_DISABLED_ATTRIBUTE,
  DHIS2_RETREAT_LOCATION_ATTRIBUTE,
  DHIS2_RETREAT_MEDIUM_ATTRIBUTE,
  DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE,
  DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE,
  DHIS2_RETREAT_TYPE_ATTRIBUTE,
  DHIS2_ROOT_ORG,
  DHIS_RETREATS_OPTION_SET_ID,
} from "../dhis2";

const { Form, Field } = ReactFinalForm;

const styles = {
  fieldRow: {
    marginBottom: 10,
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

const RetreatModel = ({ store, onCancel }) => {
  const [mutate, { called, loading, error }] = useDataMutation(optionMutation, {
    onComplete: () => {
      onCancel();
      store.metadata.loadRetreats();
    },
  });

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
            attribute: { id: DHIS2_RETREAT_CODE_ATTRIBUTE },
            value: values.code,
          },
          {
            attribute: { id: DHIS2_RETREAT_MEDIUM_ATTRIBUTE },
            value: values.medium,
          },
          {
            attribute: {
              id: DHIS2_RETREAT_CLERGY_ONLY_ATTRIBUTE,
            },
            value: values.clergyOnly,
          },
          {
            attribute: {
              id: DHIS2_RETREAT_ATTRIBUTE_PRIVATE,
            },
            value: values.privateRetreat,
          },
          {
            attribute: {
              id: DHIS2_RETREAT_ATTRIBUTE_ACCOMMODATION_NOT_PROVIDED,
            },
            value: values.accomodationNotProvided,
          },
          {
            attribute: {
              id: DHIS2_RETREAT_ATTRIBUTE_ACCOMMODATION_OPTIONAL,
            },
            value: values.accomodationOptional,
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
                        roots={DHIS2_ROOT_ORG}
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
                  name="medium"
                  label="Medium"
                  component={SingleSelectFieldFF}
                  type="number"
                  defaultValue="sinhala"
                  validate={hasValue}
                  options={store.metadata.languages.map((option) => {
                    return {
                      label: option.name,
                      value: option.code,
                    };
                  })}
                />
              </div>
              <div style={styles.fieldRow}>
                <Field
                  required
                  name="retreatType"
                  label="Retreat Type"
                  component={SingleSelectFieldFF}
                  validate={hasValue}
                  options={store.metadata.retreatTypes.map((option) => {
                    return {
                      label: option.name,
                      value: option.code,
                    };
                  })}
                />
              </div>
              <div style={styles.fieldRow}>
                <Field
                  type="checkbox"
                  name="clergyOnly"
                  label="Only for Clergy"
                  defaultValue={false}
                  component={SwitchFieldFF}
                />
              </div>
              <div style={styles.fieldRow}>
                <Field
                  type="checkbox"
                  name="privateRetreat"
                  label="Private Retreat"
                  defaultValue={false}
                  component={SwitchFieldFF}
                />
              </div>
              <div style={styles.fieldRow}>
                <Field
                  type="checkbox"
                  name="accomodationNotProvided"
                  label="Accommodation Not Provided (Travel from home)"
                  defaultValue={false}
                >
                  {({ input, meta }) => (
                    <SwitchFieldFF
                      input={{
                        ...input,
                        onChange: (e) => {
                          input.onChange(e);
                          if (e.target.checked) {
                            form.change("accomodationOptional", false);
                          }
                        },
                      }}
                      meta={meta}
                      label="Accommodation Not Provided (Travel from home)"
                    />
                  )}
                </Field>
              </div>
              <div style={styles.fieldRow}>
                <Field
                  type="checkbox"
                  name="accomodationOptional"
                  label="Accommodation Optional (Yogi can choose to stay or not)"
                  defaultValue={false}
                  component={SwitchFieldFF}
                  disabled={values.accomodationNotProvided}
                />
              </div>
              <div style={styles.fieldRow}>
                {error && (
                  <NoticeBox error title="Retreat creation failed">
                    {error?.details?.response?.errorReports
                      ?.map((report) => report.message)
                      .join(",")}
                  </NoticeBox>
                )}
              </div>
            </ModalContent>
            <ModalActions>
              <ButtonStrip end>
                <Button
                  onClick={() => {
                    form.reset();
                    onCancel();
                  }}
                  disabled={submitting}
                  secondary
                >
                  Cancel
                </Button>
                <Button
                  primary
                  type="submit"
                  loading={submitting || loading}
                  disabled={submitting || loading}
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
