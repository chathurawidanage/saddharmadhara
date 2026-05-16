import "./indicators.css";
import { Tooltip } from "@dhis2/ui";
import ID from "./img/id.png";
import PHONE from "./img/phone.png";
import AGE from "./img/age.png";
import React from "react";

interface ProfileInfoProps {
  image: string;
  tooltip: string;
  text: string | number;
}

const ProfileInfo = ({ image, tooltip, text }: ProfileInfoProps) => {
  return (
    <Tooltip content={tooltip}>
      <div className="profile-info">
        <img src={image} alt={tooltip} />
        <label>{text}</label>
      </div>
    </Tooltip>
  );
};

export const IdProfileInfo = ({ idArray }: { idArray: (string | undefined)[] }) => {
  return <ProfileInfo image={ID} tooltip="ID" text={idArray.filter(Boolean).join(" ")} />;
};

export const PhoneProfileInfo = ({ phonesArray }: { phonesArray: (string | undefined)[] }) => {
  return (
    <ProfileInfo image={PHONE} tooltip="Phone" text={phonesArray.filter(Boolean).join(" ")} />
  );
};

export const AgeProfileInfor = ({ birthday }: { birthday: string | undefined }) => {
  if (!birthday) return null;
  const years = Math.floor(
    (Date.now() - new Date(birthday).getTime()) / 31557600000,
  );
  return <ProfileInfo image={AGE} tooltip="Age" text={years} />;
};
