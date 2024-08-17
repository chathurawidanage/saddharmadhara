import "./indicators.css";
import { Tooltip } from "@dhis2/ui";
import ID from "./img/id.png";
import PHONE from "./img/phone.png";
import AGE from "./img/age.png";

const ProfileInfo = ({ image, tooltip, text }) => {
    return (
        <Tooltip content={tooltip}>
            <div className="profile-info">
                <img src={image} />
                <label>{text}</label>
            </div>
        </Tooltip>
    )
};

export const IdProfileInfo = ({ idArray }) => {
    return <ProfileInfo image={ID} tooltip="ID" text={idArray.join(" ")} />
};

export const PhoneProfileInfo = ({ phonesArray }) => {
    return <ProfileInfo image={PHONE} tooltip="Phone" text={phonesArray.join(" ")} />
};

export const AgeProfileInfor = ({ birthday }) => {
    let years = Math.floor((Date.now() - new Date(birthday).getTime()) / 31557600000);
    return <ProfileInfo image={AGE} tooltip="Age" text={years} />
};