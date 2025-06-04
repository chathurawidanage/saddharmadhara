import {
    Tooltip
} from "@dhis2/ui";
import { observer } from "mobx-react";
import COMMENT from "./img/comment.png";

const SpecialCommentsIndicator = observer(({ trackedEntity }) => {
    return (
        <div className="special-comments">
            {trackedEntity.specialComments
                .filter(comment => comment.comment?.trim().length > 0)
                .map(comment => {
                    return (
                        <Tooltip content={<div>
                            <h6>{new Date(comment.occurredAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}</h6>
                            <p>
                                {comment.comment}
                            </p>
                        </div>} key={comment.eventId}>
                            <div className="indicator special-comment-indicator">
                                <img src={COMMENT} />
                            </div>
                        </Tooltip>
                    );
                })}
        </div>
    )
});

export default SpecialCommentsIndicator;