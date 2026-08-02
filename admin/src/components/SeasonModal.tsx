import { useDataMutation } from "@dhis2/app-runtime";
import {
  Button,
  ButtonStrip,
  InputFieldFF,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  NoticeBox,
  ReactFinalForm,
  SingleSelectFieldFF,
  hasValue,
  CircularLoader,
} from "@dhis2/ui";
import React from "react";
import {
  DHIS2_RETREAT_DATE_ATTRIBUTE,
  DHIS2_RETREAT_TYPE_ATTRIBUTE,
  DHIS2_SEASON_OPTION_SET_ID,
  DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE,
  DHIS2_RETREAT_MEDIUM_ATTRIBUTE,
} from "../dhis2";

import RootStore from "../stores/root";

const { Form, Field } = ReactFinalForm;

const styles = {
  fieldRow: {
    marginBottom: 16,
  },
};

const seasonMutation: object = {
  resource: "options",
  data: ({ code, name, attributeValues }: any) => ({
    code,
    name,
    optionSet: { id: DHIS2_SEASON_OPTION_SET_ID },
    attributeValues,
  }),
  type: "create",
};

interface SeasonModalProps {
  store: RootStore;
  onCancel: () => void;
}

interface SeasonFormValues {
  startDate: string;
  retreatType: string;
  noOfDays: string;
  medium: string;
}

const SeasonModal = ({ store, onCancel }: SeasonModalProps) => {
  const [createSeason, { loading, error }] = useDataMutation(seasonMutation, {
    onComplete: () => {
      store.metadata?.loadSeasons();
      onCancel();
    },
  });

  if (!store.metadata || store.metadata.languages.length === 0 || store.metadata.requestStates.loadingSupporting) {
    return (
      <Modal onClose={onCancel}>
        <ModalTitle>New Season</ModalTitle>
        <ModalContent>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
            <CircularLoader />
          </div>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Form
      onSubmit={(values: SeasonFormValues) => {
        const date = new Date(values.startDate);
        const year = date.getFullYear();
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        const monthName = months[date.getMonth()];
        const monthNum = (date.getMonth() + 1).toString().padStart(2, "0");

        const selectedType = store.metadata?.retreatTypes?.find(
          (t: any) => t.code === values.retreatType
        );
        const retreatTypeName = selectedType ? selectedType.name : values.retreatType;

        const selectedMedium = store.metadata?.languages?.find(
          (l: any) => l.code === values.medium
        );
        const mediumName = selectedMedium ? selectedMedium.name : values.medium;

        const name = `${year} ${monthName} - ${retreatTypeName} - ${values.noOfDays} Days - ${mediumName}`;
        const code = `${year}_${monthNum}_${values.noOfDays}d_${values.medium}_${values.retreatType.toLowerCase()}`;

        const attributeValues = [
          {
            attribute: { id: DHIS2_RETREAT_DATE_ATTRIBUTE },
            value: values.startDate,
          },
          {
            attribute: { id: DHIS2_RETREAT_TYPE_ATTRIBUTE },
            value: values.retreatType,
          },
          {
            attribute: { id: DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE },
            value: values.noOfDays,
          },
          {
            attribute: { id: DHIS2_RETREAT_MEDIUM_ATTRIBUTE },
            value: values.medium,
          },
        ];

        createSeason({
          name,
          code,
          attributeValues,
        });
      }}
    >
      {({ handleSubmit, form, submitting }) => (
        <form onSubmit={handleSubmit}>
          <Modal onClose={onCancel}>
            <ModalTitle>New Season</ModalTitle>
            <ModalContent>
              <div style={styles.fieldRow}>
                <Field
                  required
                  name="startDate"
                  label="Season Start Date"
                  component={InputFieldFF}
                  type="date"
                  validate={hasValue}
                />
              </div>

              <div style={styles.fieldRow}>
                <Field
                  required
                  name="retreatType"
                  label="Fixed Retreat Type"
                  component={SingleSelectFieldFF}
                  tabIndex="0"
                  validate={hasValue}
                  options={(store.metadata?.retreatTypes || []).map((option: any) => ({
                    label: option.name,
                    value: option.code,
                  }))}
                />
              </div>

              <div style={styles.fieldRow}>
                <Field
                  required
                  name="noOfDays"
                  label="Number of Days"
                  component={InputFieldFF}
                  type="number"
                  validate={hasValue}
                />
              </div>

              <div style={styles.fieldRow}>
                <Field
                  required
                  name="medium"
                  label="Language (Retreat Medium)"
                  component={SingleSelectFieldFF}
                  tabIndex="0"
                  validate={hasValue}
                  defaultValue="sinhala"
                  options={(store.metadata?.languages || []).map((option: any) => ({
                    label: option.name,
                    value: option.code,
                  }))}
                />
              </div>

              {error && (
                <div style={styles.fieldRow}>
                  <NoticeBox error title="Season creation failed">
                    {error?.details?.response?.errorReports
                      ?.map((report) => report.message)
                      .join(",") || "An error occurred while creating the season option."}
                  </NoticeBox>
                </div>
              )}
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
                  Create Season
                </Button>
              </ButtonStrip>
            </ModalActions>
          </Modal>
        </form>
      )}
    </Form>
  );
};

export default SeasonModal;
