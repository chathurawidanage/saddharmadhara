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
import { useDataEngine } from "@dhis2/app-runtime";
import {
  DHIS2_ROOT_ORG,
  DHIS2_RETREAT_FEMALE_YOGIS_ATTRIBUTE,
  DHIS2_RETREAT_MALE_YOGIS_ATTRIBUTE,
} from "../../dhis2";
import { RetreatFormValues, generateRetreatName } from "../../utils/retreatFormMapping";
import RootStore from "../../stores/root";
import { Season } from "../../types/domain";


const { Field, FormSpy } = ReactFinalForm;

export const validateRetreatCode = (value: any) => {
  const presenceError = hasValue(value);
  if (presenceError) {
    return presenceError;
  }
  const regex = /^[A-Z0-9]+$/;
  if (!regex.test(value)) {
    return "Code must contain only uppercase letters (A-Z) and numbers (0-9)";
  }
  return undefined;
};

interface RetreatFormFieldsProps {
  values: RetreatFormValues;
  form: { change: (name: string, value: any) => void };
  store: RootStore;
  isSeasonLocked?: boolean;
  preconfiguredSeason?: Season;
}

const RetreatFormFields = ({ values, form, store, isSeasonLocked, preconfiguredSeason }: RetreatFormFieldsProps) => {
  const dataEngine = useDataEngine();
  if (!store.metadata) return null;

  const currentSeason = store.metadata.seasons.find(s => s.code === values.season) || preconfiguredSeason;
  const minDate = currentSeason?.startDate ? (() => {
    const d = currentSeason.startDate;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })() : undefined;

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

          const femaleCount = parseInt(values.femaleYogis || "0", 10) || 0;
          const maleCount = parseInt(values.maleYogis || "0", 10) || 0;
          const derivedTotal = String(femaleCount + maleCount);
          if (values.noOfYogis !== derivedTotal) {
            form.change("noOfYogis", derivedTotal);
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
          validate={validateRetreatCode}
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
          min={minDate}
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
          disabled={isSeasonLocked}
        />
      </div>
      <div className="retreat-form-field-row">
        <Field name="location" label="Location" validate={hasValue} required>
          {(props: { input: { onChange: (e: object) => void; value: any } }) => (
            <div>
              <Label required>Location</Label>
              <OrganisationUnitTree
                roots={[DHIS2_ROOT_ORG]}
                onChange={async (e: { path: string; displayName: string; id: string }) => {
                  props.input.onChange(e);
                  try {
                    const data: any = await dataEngine.query({
                      orgUnit: {
                        resource: `organisationUnits/${e.id}.json`,
                        params: {
                          fields: "attributeValues[attribute[id],value]",
                        },
                      },
                    });

                    const attrs = data?.orgUnit?.attributeValues || [];
                    const femaleCount = attrs.find((a: any) => a.attribute?.id === DHIS2_RETREAT_FEMALE_YOGIS_ATTRIBUTE)?.value;
                    const maleCount = attrs.find((a: any) => a.attribute?.id === DHIS2_RETREAT_MALE_YOGIS_ATTRIBUTE)?.value;

                    if (femaleCount) {
                      form.change("femaleYogis", femaleCount);
                    }
                    if (maleCount) {
                      form.change("maleYogis", maleCount);
                    }
                  } catch (err) {
                    console.error("Failed to fetch org unit attributes", err);
                  }
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
          name="femaleYogis"
          label="Female Yogis Count"
          component={InputFieldFF}
          type="number"
          validate={hasValue}
        />
      </div>
      <div className="retreat-form-field-row">
        <Field
          required
          name="maleYogis"
          label="Male Yogis Count"
          component={InputFieldFF}
          type="number"
          validate={hasValue}
        />
      </div>
      <div className="retreat-form-field-row">
        <Field
          required
          name="noOfYogis"
          label="No of Yogis"
          component={InputFieldFF}
          type="number"
          validate={hasValue}
          disabled={true}
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
          disabled={isSeasonLocked}
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
          disabled={isSeasonLocked}
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
          name="season"
          label="Retreat Season"
          component={SingleSelectFieldFF}
          disabled={isSeasonLocked}
          options={[
            { label: "No Season", value: "" },
            ...store.metadata.seasons.map((option) => ({
              label: option.name,
              value: option.code,
            }))
          ]}
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
