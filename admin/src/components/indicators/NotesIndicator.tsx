import { Tooltip } from "@dhis2/ui";
import { observer } from "mobx-react";
import React from "react";
import NOTES from "./img/notes.png";
import { Yogi } from "../../types/domain";

interface NotesIndicatorProps {
  trackedEntity: Yogi;
}

const NotesIndicator = observer(({ trackedEntity }: NotesIndicatorProps) => {
  return (
    <div className="special-comments">
      {trackedEntity.notes.map((note, index) => {
        return (
          <Tooltip
            content={
              <div>
                <p>{note.value}</p>
                <p>Added by {note.createdBy?.username}</p>
              </div>
            }
            key={index}
          >
            <div className="indicator special-comment-indicator">
              <img src={NOTES} alt="notes" />
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
});

export default NotesIndicator;
