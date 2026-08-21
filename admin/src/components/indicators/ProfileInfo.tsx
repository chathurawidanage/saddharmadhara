import "./indicators.css";
import { Tooltip } from "@dhis2/ui";
import ID from "./img/id.png";
import PHONE from "./img/phone.png";
import AGE from "./img/age.png";
import React from "react";
import { FaWhatsapp } from "react-icons/fa";

interface ProfileInfoProps {
  image?: string;
  icon?: React.ReactNode;
  tooltip: string;
  text: string | number;
}

const ProfileInfo = ({ image, icon, tooltip, text }: ProfileInfoProps) => {
  return (
    <Tooltip content={tooltip}>
      <div className="profile-info">
        {image && <img src={image} alt={tooltip} />}
        {icon}
        <label>{text}</label>
      </div>
    </Tooltip>
  );
};

export const IdProfileInfo = ({ idArray }: { idArray: (string | undefined)[] }) => {
  const text = idArray.filter(Boolean).join(" ");
  if (!text) return null;
  return <ProfileInfo image={ID} tooltip="ID" text={text} />;
};

export const PhoneProfileInfo = ({ phonesArray }: { phonesArray: (string | undefined)[] }) => {
  const text = phonesArray.filter(Boolean).join(" ");
  if (!text) return null;
  return (
    <ProfileInfo image={PHONE} tooltip="Phone" text={text} />
  );
};

export const WhatsappProfileInfo = ({ whatsapp }: { whatsapp: string | undefined }) => {
  if (!whatsapp?.trim()) return null;
  return (
    <ProfileInfo
      icon={<FaWhatsapp style={{ color: "#25D366", fontSize: "1.25em" }} />}
      tooltip="WhatsApp"
      text={whatsapp.trim()}
    />
  );
};

export const AgeProfileInfor = ({ birthday }: { birthday: string | undefined }) => {
  if (!birthday) return null;
  const years = Math.floor(
    (Date.now() - new Date(birthday).getTime()) / 31557600000,
  );
  return <ProfileInfo image={AGE} tooltip="Age" text={years} />;
};
