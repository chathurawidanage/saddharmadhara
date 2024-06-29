import MALE from "./img/male.png";
import FEMALE from "./img/female.png";
import "./indicators.css";
import { Tooltip } from "@dhis2/ui";

const GenderIndicator = ({ gender }) => {
    if (!gender) {
        return null;
    }

    return (
        <Tooltip content={gender.toUpperCase()}>
            <div className="gender-indicator indicator">
                <img src={gender.toLowerCase() === "male" ? MALE : FEMALE} />
            </div>
        </Tooltip>
    )
};

export default GenderIndicator;