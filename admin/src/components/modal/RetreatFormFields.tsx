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
import { RetreatFormValues, generateRetreatName } from "../../utils/retreatFormMapping";
import RootStore from "../../stores/root";


const { Field, FormSpy } = ReactFinalForm;

interface RetreatFormFieldsProps {
  values: RetreatFormValues;
  form: { change: (name: string, value: any) => void };
  store: RootStore;
}

const RetreatFormFields = ({ values, form, store }: RetreatFormFieldsProps) => {
  if (!store.metadata) return null;

  return (
    <>
      <FormSpy
        subscription={{ values: true }}
        onChange={({ values }: { values: RetreatFormValues }) => {

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
      <div className="retreat-form-field-row">
        <Field
          name="name"
          label="Retreat Name"
          component={InputFieldFF}
          type="text"
          validate={hasValue}
          disabled={values.autoGenerateName}
        />
      </div>
      <div className="retreat-form-field-row">
        <Field
          type="checkbox"
          name="autoGenerateName"
          label="Auto Generate Name"
          defaultValue={true}
          component={SwitchFieldFF}
        />
      </div>
      <div className="retreat-form-field-row">
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
      <div className="retreat-form-field-row">
        <Field
          required
          name="date"
          label="Date"
          component={InputFieldFF}
          type="date"
          validate={hasValue}
        />
      </div>
      <div className="retreat-form-field-row">
        <Field
          required
          name="noOfDays"
          label="No of Days"
          component={InputFieldFF}
          type="number"
          validate={hasValue}
        />
      </div>
      <div className="retreat-form-field-row">
        <Field name="location" label="Location" validate={hasValue} required>
          {(props: { input: { onChange: (e: object) => void; value: any } }) => (
            <div>
              <Label required>Location</Label>
              <OrganisationUnitTree
                roots={[DHIS2_ROOT_ORG]}
                onChange={(e: { path: string; displayName: string; id: string }) => {
                  props.input.onChange(e);
                }}

                autoExpandLoadingError={true}
                selected={props.input.value ? [props.input.value.path] : []}
              />
            </div>
          )}
        </Field>
      </div>
      <div className="retreat-form-field-row">
        <Field
          required
          name="noOfYogis"
          label="No of Yogis"
          component={InputFieldFF}
          type="number"
          validate={hasValue}
        />
      </div>
      <div className="retreat-form-field-row">
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
      <div className="retreat-form-field-row">
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
      <div className="retreat-form-field-row">
        <Field
          type="checkbox"
          name="clergyOnly"
          label="Only for Clergy"
          defaultValue={false}
          component={SwitchFieldFF}
        />
      </div>
      <div className="retreat-form-field-row">
        <Field
          type="checkbox"
          name="privateRetreat"
          label="Private Retreat"
          defaultValue={false}
          component={SwitchFieldFF}
        />
      </div>
      <div className="retreat-form-field-row">
        <Field
          type="checkbox"
          name="accomodationNotProvided"
          label="Accommodation Not Provided (Travel from home)"
          defaultValue={false}
        >
          {({ input, meta }: { input: { onChange: (e: any) => void; value: any }; meta: object }) => (
            <SwitchFieldFF
              input={{
                ...input,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <div className="retreat-form-field-row">
        <Field
          type="checkbox"
          name="accomodationOptional"
          label="Accommodation Optional (Yogi can choose to stay or not)"
          defaultValue={false}
          component={SwitchFieldFF}
          disabled={values.accomodationNotProvided}
        />
      </div>
      <div className="retreat-form-field-row">
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
