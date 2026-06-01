import { useConfig } from "@dhis2/app-runtime";
import { Button, TableRow, TableCell, Tooltip } from "@dhis2/ui";
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
import { Retreat, Yogi, EoiSummary, MaritalState } from "../../types/domain";
import { getYogiSortScore } from "../../utils/yogiUtils";

interface YogiRowProps {
  trackedEntity: Yogi;
  currentRetreat: Retreat;
  allRetreats?: Retreat[];
  eoiSummary?: EoiSummary[];
  actions?: ReactNode;
}

const YogiRow = observer(({ trackedEntity, currentRetreat, allRetreats, eoiSummary, actions }: YogiRowProps) => {
    const { baseUrl } = useConfig();

    const rowClassNames = [];

    if (
      trackedEntity.attributes.maritalState === MaritalState.REVEREND
    ) {
      rowClassNames.push("yogi-row-reverend");
    }

    return (
      <TableRow className={rowClassNames.join(" ")} key={trackedEntity.id}>
        <TableCell className="yogi-row-td">
          <div className="yogi-name-row">
            {trackedEntity.attributes.fullName}
            {(() => {
              const scoreObj = getYogiSortScore(
                trackedEntity,
                allRetreats,
                eoiSummary,
                currentRetreat,
              );
              const { total, breakdown } = scoreObj;
              return (
                <Tooltip
                  content={
                    <div className="yogi-score-tooltip">
                      <div className="yogi-score-tooltip-title">Score Breakdown</div>
                      <div className="yogi-score-tooltip-row">
                        <span className="yogi-score-tooltip-label">Status Score:</span>
                        <span className="yogi-score-tooltip-value">+{breakdown.statusScore}</span>
                      </div>
                      <div className="yogi-score-tooltip-reason">{breakdown.statusReason}</div>
                      
                      <div className="yogi-score-tooltip-row">
                        <span className="yogi-score-tooltip-label">Age Score:</span>
                        <span className="yogi-score-tooltip-value">+{breakdown.ageScore.toFixed(1)}</span>
                      </div>
                      <div className="yogi-score-tooltip-reason">{breakdown.ageReason}</div>
                      
                      <div className="yogi-score-tooltip-row">
                        <span className="yogi-score-tooltip-label">Participation:</span>
                        <span className="yogi-score-tooltip-value">+{breakdown.participationScore}</span>
                      </div>
                      <div className="yogi-score-tooltip-reason">{breakdown.participationReason}</div>

                      <div className="yogi-score-tooltip-row">
                        <span className="yogi-score-tooltip-label">Penalties:</span>
                        <span className="yogi-score-tooltip-value">{breakdown.penaltyScore}</span>
                      </div>
                      <div className="yogi-score-tooltip-reason">{breakdown.penaltyReason}</div>
                      
                      <div className="yogi-score-tooltip-row">
                        <span className="yogi-score-tooltip-label">Flexibility Multiplier:</span>
                        <span className="yogi-score-tooltip-value">x{breakdown.mFlex.toFixed(2)}</span>
                      </div>
                      <div className="yogi-score-tooltip-reason">{breakdown.mFlexReason}</div>
                      
                      <div className="yogi-score-tooltip-formula">
                        Total: ({breakdown.statusScore} + {breakdown.ageScore.toFixed(1)} + {breakdown.participationScore} + ({breakdown.penaltyScore})) * {breakdown.mFlex.toFixed(2)} = {total}
                      </div>
                    </div>
                  }
                >
                  <span className="yogi-score">
                    {total.toFixed(2)}
                  </span>
                </Tooltip>
              );
            })()}
            <Button
              small
              onClick={() => {
                const tempElement = document.createElement("a");
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
