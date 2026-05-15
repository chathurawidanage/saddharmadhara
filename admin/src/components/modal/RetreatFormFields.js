import React from "react";
import {
  InputFieldFF,
  Label,
  OrganisationUnitTree,
  ReactFinalForm,
  SingleSelectFieldFF,
  hasValue,
  SwitchFieldFF,
} from "@dhis2/ui";
import { DHIS2_ROOT_ORG } from "../../dhis2";
import { generateRetreatName } from "../../utils/retreatFormMapping";

const { Field, FormSpy } = ReactFinalForm;

const styles = {
  fieldRow: {
    marginBottom: 10,
  },
};

const RetreatFormFields = ({ values, form, store }) => {
  return (
    <>
      <FormSpy
        subscription={{ values: true }}
        onChange={({ values }) => {
          if (values.autoGenerateName && values.date && values.location) {
            const generatedName = generateRetreatName(
              values.date,
              values.location.displayName,
            );

            if (values.name !== generatedName) {
              form.change("name", generatedName);
            }
          }
        }}
      />
      <div style={styles.fieldRow}>
        <Field
          name="name"
          label="Retreat Name"
          component={InputFieldFF}
          type="text"
          validate={hasValue}
          disabled={values.autoGenerateName}
        />
      </div>
      <div style={styles.fieldRow}>
        <Field
          type="checkbox"
          name="autoGenerateName"
          label="Auto Generate Name"
          defaultValue={true}
          component={SwitchFieldFF}
        />
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
        <Field name="location" label="Location" validate={hasValue} required>
          {(props) => (
            <div>
              <Label required>Location</Label>
              <OrganisationUnitTree
                roots={DHIS2_ROOT_ORG}
                onChange={(e) => {
                  props.input.onChange(e);
                }}
                autoExpandLoadingError={true}
                selected={props.input.value ? [props.input.value.path] : []}
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
        <Field
          type="checkbox"
          name="disabled"
          label="Disable Retreat"
          defaultValue={false}
          component={SwitchFieldFF}
        />
      </div>
    </>
  );
};

export default RetreatFormFields;
