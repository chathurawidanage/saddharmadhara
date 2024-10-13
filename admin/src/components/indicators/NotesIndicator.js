import {
    Tooltip
} from "@dhis2/ui";
import { observer } from "mobx-react";
import NOTES from "./img/notes.png";

const NotesIndicator = observer(({ trackedEntity }) => {
    return (
        <div className="special-comments">
            {trackedEntity.notes
                .map((note, index) => {
                    return (
                        <Tooltip content={<div>
                            <p>
                                {note.value}
                            </p>
                            <p>
                                Added by {note.createdBy?.username}
                            </p>
                        </div>} key={index}>
                            <div className="indicator special-comment-indicator">
                                <img src={NOTES} />
                            </div>
                        </Tooltip>
                    );
                })}
        </div>
    )
});

export default NotesIndicator;