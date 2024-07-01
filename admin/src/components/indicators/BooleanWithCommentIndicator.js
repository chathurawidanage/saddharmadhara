
import "./indicators.css";
import { Tooltip } from "@dhis2/ui";
import KIDS from "./img/kids.png";
import PERMISSION from "./img/key.png";
import CROSS from "./img/cross.png";
import STRESS from "./img/stressv3.png";

const BooleanWithCommentIndicator = ({ bool, showIf, comment, img, className }) => {
    if (!bool || bool !== showIf) {
        return null;
    }

    return (
        <Tooltip content={comment}>
            <div className={`indicator ${className}`}>
                <img src={img} />
            </div>
        </Tooltip>
    )
};

export const HasKidsIndicator = ({ hasKids, comment }) => {
    return <BooleanWithCommentIndicator bool={hasKids} showIf="true" comment={comment}
        img={KIDS} className="has-kids-indicator" />
};

export const HasPermission = ({ hasPermission, comment }) => {
    return <BooleanWithCommentIndicator bool={hasPermission} showIf="false" comment={comment}
        img={PERMISSION} className="has-permission-indicator" />
};

export const HasUnattendedDeformities = ({ hasUnattendedDeformities, comment }) => {
    return <BooleanWithCommentIndicator bool={hasUnattendedDeformities} showIf="true" comment={comment}
        img={CROSS} className="has-unattended-deformities-indicator" />
};

export const HasStress = ({ hasStress, comment }) => {
    return <BooleanWithCommentIndicator bool={hasStress} showIf="true" comment={comment}
        img={STRESS} className="has-stress-indicator" />
};
