import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import {
  Button,
  ButtonStrip,
  CircularLoader,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  NoticeBox,
  ReactFinalForm,
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React from "react";
import { DHIS_RETREATS_OPTION_SET_ID } from "../dhis2";
import { useStore } from "../stores/StoreProvider";
import {
  generateRetreatName,
  mapFormValuesToAttributeValues,
  mapRetreatToInitialValues,
} from "../utils/retreatFormMapping";
import RetreatFormFields from "./modal/RetreatFormFields";

const { Form } = ReactFinalForm;

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

const updateMutation = {
  resource: "options",
  id: ({ id }) => id,
  data: ({ code, name, attributeValues }) => ({
    code,
    name,
    optionSet: { id: DHIS_RETREATS_OPTION_SET_ID },
    attributeValues,
  }),
  type: "update",
};

const editDataQuery = {
  option: {
    resource: "options",
    id: ({ id }) => id,
    params: {
      fields: "attributeValues[attribute[id],value],name,code",
    },
  },
  orgUnit: {
    resource: "organisationUnits",
    id: ({ locationId }) => locationId,
    params: {
      fields: "id,path,displayName",
    },
  },
};

const RetreatModal = observer(({ onCancel, retreat }) => {
  const store = useStore();

  const { data: editData, loading: editLoading } = useDataQuery(editDataQuery, {
    variables: { id: retreat?.id, locationId: retreat?.location },
    lazy: !retreat,
  });

  const [create, { loading: creating, error: createError }] = useDataMutation(
    optionMutation,
    {
      onComplete: () => {
        onCancel();
        store.metadata.loadRetreats();
      },
    },
  );

  const [update, { loading: updating, error: updateError }] = useDataMutation(
    updateMutation,
    {
      onComplete: () => {
        onCancel();
        store.metadata.loadRetreats();
      },
    },
  );

  const initialValues = React.useMemo(() => {
    return mapRetreatToInitialValues(retreat, editData);
  }, [editData, retreat]);

  const loading = creating || updating || editLoading;

  if (retreat && editLoading) {
    return (
      <Modal>
        <ModalTitle>Edit Retreat</ModalTitle>
        <ModalContent>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
            }}
          >
            <CircularLoader />
          </div>
        </ModalContent>
      </Modal>
    );
  }

  const error = createError || updateError;

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => {
        const attributeValues = mapFormValuesToAttributeValues(values);

        const generatedString = generateRetreatName(
          values.date,
          values.location?.displayName,
        );

        let optionName = values.autoGenerateName
          ? generatedString
          : values.name;

        if (retreat) {
          update({
            id: retreat.id,
            name: optionName,
            code: retreat.code,
            attributeValues,
          });
        } else {
          create({ name: optionName, code: generatedString, attributeValues });
        }
      }}
    >
      {({ handleSubmit, form, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <Modal>
            <ModalTitle>{retreat ? "Edit Retreat" : "New Retreat"}</ModalTitle>
            <ModalContent>
              <RetreatFormFields 
                values={values} 
                form={form} 
                store={store} 
              />
              
              <div style={{ marginBottom: 10 }}>
                {store.metadata.requestStates.supportingError && (
                  <NoticeBox error title="Supporting metadata unavailable">
                    {store.metadata.requestStates.supportingError}
                  </NoticeBox>
                )}
              </div>
              <div style={{ marginBottom: 10 }}>
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
                >
                  {retreat ? "Update" : "Create"}
                </Button>
              </ButtonStrip>
            </ModalActions>
          </Modal>
        </form>
      )}
    </Form>
  );
});

export default RetreatModal;
