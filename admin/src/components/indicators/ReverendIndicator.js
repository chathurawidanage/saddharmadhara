import REVEREND from "./img/reverend.png";
import "./indicators.css";
import { Tooltip } from "@dhis2/ui";

const ReverendIndicator = () => {
    return (
        <Tooltip content="Reverend">
            <div className="reverend-indicator indicator">
                <img src={REVEREND} />
            </div>
        </Tooltip>
    )
};

export default ReverendIndicator;