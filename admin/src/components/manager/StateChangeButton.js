import { useDataMutation } from "@dhis2/app-runtime";
import { DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE, DHIS2_RETREAT_DATA_ELEMENT, DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT, DHIS_PROGRAM } from "../../dhis2";
import {
    MenuItem
} from "@dhis2/ui";

const StateChangeButton = ({
    label,
    event,
    selectionState,
    retreatCode,
    onComplete,
    onError,
}) => {
    const mutation = {
        resource: "events",
        id: event,
        data: {
            program: DHIS_PROGRAM,
            programStage: DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
            status: "COMPLETED",
            dataValues: [
                {
                    dataElement: DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
                    value: selectionState,
                },
                {
                    dataElement: DHIS2_RETREAT_DATA_ELEMENT,
                    value: retreatCode,
                },
            ],
        },
        type: "update",
    };
    const [mutate, { called, loading, error, data }] = useDataMutation(mutation, {
        onComplete,
        onError,
    });

    return <MenuItem onClick={mutate} label={label} />;
};

export default StateChangeButton;