
import "./indicators.css";
import { Tooltip } from "@dhis2/ui";
import KIDS from "./img/kids.png";

const BooleanWithComment = ({ bool, showIf, comment, img, className }) => {
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

export const HasKids = ({hasKids, comment}) =>{
    return <BooleanWithComment bool={hasKids} showIf="true" comment={comment}
        img={KIDS} className="has-kids-indicator" />
};