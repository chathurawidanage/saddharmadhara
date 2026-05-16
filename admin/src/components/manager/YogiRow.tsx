import { useConfig } from "@dhis2/app-runtime";
import { Button, TableRow, TableCell } from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { ReactNode } from "react";
import {
  DHIS2_ROOT_ORG,
  DHIS_PROGRAM,
} from "../../dhis2";
import ActiveApplicationIndicator from "../indicators/ActiveApplicationsIndicator";
import {
  HasKidsIndicator,
  HasPermission,
  HasStress,
  HasUnattendedDeformities,
} from "../indicators/BooleanWithCommentIndicator";
import GenderIndicator from "../indicators/GenderIndicator";
import "./YogiRow.css";
import SpecialCommentsIndicator from "../indicators/SpecialCommentsIndicator";
import ParticipationIndicator from "../indicators/ParticipationIndicator";
import {
  AgeProfileInfor,
  IdProfileInfo,
  PhoneProfileInfo,
} from "../indicators/ProfileInfo";
import { BiLinkExternal } from "react-icons/bi";
import NotesIndicator from "../indicators/NotesIndicator";
import { Retreat, Yogi } from "../../types/domain";

interface YogiRowProps {
  trackedEntity: Yogi;
  currentRetreat: Retreat;
  actions?: ReactNode;
}

const YogiRow = observer(({ trackedEntity, currentRetreat, actions }: YogiRowProps) => {
    const { baseUrl } = useConfig();

    const rowClassNames = [];

    if (
      trackedEntity.attributes.maritalState === "reverend"
    ) {
      rowClassNames.push("yogi-row-reverend");
    }

    return (
      <TableRow className={rowClassNames.join(" ")} key={trackedEntity.id}>
        <TableCell className="yogi-row-td">
          <div className="yogi-name-row">
            {trackedEntity.attributes.fullName}
            <Button
              small
              onClick={() => {
                let tempElement = document.createElement("a");
                tempElement.href = baseUrl;
                window.open(
                  new URL(
                    `dhis-web-tracker-capture/index.html#/dashboard?tei=${trackedEntity.id}&program=${DHIS_PROGRAM}&ou=${DHIS2_ROOT_ORG}`,
                    tempElement.href,
                  ).toString(),
                  "_blank",
                );
              }}
            >
              <BiLinkExternal />
            </Button>
          </div>
          <div className="yogi-profile-info">
            <IdProfileInfo
              idArray={[
                trackedEntity.attributes.nic,
                trackedEntity.attributes.passport,
              ]}
            />
            <PhoneProfileInfo
              phonesArray={[
                trackedEntity.attributes.mobile,
              ]}
            />
            <AgeProfileInfor
              birthday={trackedEntity.attributes.dob}
            />
          </div>
          <div>
            <NotesIndicator trackedEntity={trackedEntity} />
          </div>
        </TableCell>
        <TableCell className="yogi-row-td">
          <div className="mini-indicators-container">
            <GenderIndicator
              gender={trackedEntity.attributes.gender}
            />
            <HasKidsIndicator
              hasKids={trackedEntity.attributes.hasKids}
              comment={
                trackedEntity.attributes.hasKidsComment
              }
            />
            <HasPermission
              hasPermission={
                trackedEntity.attributes.hasPermission
              }
              comment={
                trackedEntity.attributes.hasPermissionComment
              }
            />
            <HasUnattendedDeformities
              hasUnattendedDeformities={
                trackedEntity.attributes.hasUnattendedDeformities
              }
              comment={
                trackedEntity.attributes.hasUnattendedDeformitiesComment
              }
            />
            <HasStress
              hasStress={
                trackedEntity.attributes.hasStress
              }
              comment={
                trackedEntity.attributes.hasStressComment
              }
            />
            <SpecialCommentsIndicator trackedEntity={trackedEntity} />
          </div>
        </TableCell>
        <TableCell className="yogi-row-td">
          <ActiveApplicationIndicator
            currentRetreat={currentRetreat}
            trackedEntity={trackedEntity}
          />
        </TableCell>
        <TableCell className="yogi-row-td">
          <ParticipationIndicator trackedEntity={trackedEntity} />
        </TableCell>
        {!currentRetreat.finalized && (
          <TableCell className="yogi-row-td">
            <div className="yogi-row-actions">{actions}</div>
          </TableCell>
        )}
      </TableRow>
    );
  },
);

export default YogiRow;
