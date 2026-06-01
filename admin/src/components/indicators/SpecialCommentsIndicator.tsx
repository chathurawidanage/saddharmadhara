import { Tooltip } from "@dhis2/ui";
import { observer } from "mobx-react";
import React from "react";
import COMMENT from "./img/comment.png";
import { Yogi } from "../../types/domain";

interface SpecialCommentsIndicatorProps {
  trackedEntity: Yogi;
}

const SpecialCommentsIndicator = observer(({ trackedEntity }: SpecialCommentsIndicatorProps) => {
  return (
    <div className="special-comments">
      {trackedEntity.specialComments
        .filter((comment) => comment.comment?.trim().length > 0)
        .map((comment) => {
          return (
            <Tooltip
              content={
                <div>
                  <h6>
                    {new Date(comment.occurredAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </h6>
                  <p>{comment.comment}</p>
                </div>
              }
              key={comment.eventId}
            >
              <div className="indicator special-comment-indicator">
                <img src={COMMENT} alt="comment" />
              </div>
            </Tooltip>
          );
        })}
    </div>
  );
});

export default SpecialCommentsIndicator;
