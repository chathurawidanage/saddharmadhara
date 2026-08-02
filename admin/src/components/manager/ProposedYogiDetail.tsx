import { useConfig } from "@dhis2/app-runtime";
import { Button, Tooltip } from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { BiLinkExternal, BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { DHIS2_ROOT_ORG, DHIS_PROGRAM } from "../../dhis2";
import ActiveApplicationIndicator from "../indicators/ActiveApplicationsIndicator";
import ParticipationIndicator from "../indicators/ParticipationIndicator";
import { Retreat, Yogi, EoiSummary, MaritalState, Gender } from "../../types/domain";
import { getYogiSortScore } from "../../utils/yogiUtils";
import { ProposedActions } from "./YogiRowActions";
import { YogiScoreTooltip } from "./YogiScoreTooltip";

import KIDS from "../indicators/img/kids.png";
import PERMISSION from "../indicators/img/key.png";
import CROSS from "../indicators/img/cross.png";
import STRESS from "../indicators/img/stressv3.png";
import BEER from "../indicators/img/beer.png";
import LAW from "../indicators/img/law.png";
import CHRONIC_ILLNESS from "../indicators/img/chronic_illness.png";
import AMPUTEE from "../indicators/img/amputee.png";

import "./ProposedYogiDetail.css";

interface ProposedYogiDetailProps {
  yogi: Yogi;
  retreat: Retreat;
  allRetreats: Retreat[];
  eoiSummary: EoiSummary[];
}

export const ProposedYogiDetail = observer(({
  yogi,
  retreat,
  allRetreats,
  eoiSummary,
}: ProposedYogiDetailProps) => {
  const { baseUrl } = useConfig();
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);

  const comments = React.useMemo(() => {
    return (yogi.specialComments || [])
      .filter((comment) => comment.comment?.trim().length > 0)
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }, [yogi.specialComments]);

  const staffNotes = React.useMemo(() => {
    return [...(yogi.notes || [])]
      .filter((note) => note.value?.trim().length > 0)
      .reverse();
  }, [yogi.notes]);

  const scoreObj = getYogiSortScore(yogi, allRetreats, eoiSummary, retreat);
  const { total, breakdown } = scoreObj;

  const isReverend = yogi.attributes.maritalState === MaritalState.REVEREND;

  // Helper to fetch the value for a prioritized list of alias keys
  const getValue = (keys: string[]) => {
    for (const k of keys) {
      const val = yogi.attributes[k];
      if (val !== undefined && val !== null && val !== "") {
        return val;
      }
    }
    return null;
  };


  // Mapped indicators derived from application form questions
  const readinessQuestions = [
    {
      label: "Permission to Attend (Spouse/Parents/Guardian/Employer/Monastery)",
      keys: ["hasPermission", "QGXYhZMXfnc"],
      type: "boolean" as const,
      commentKeys: ["hasPermissionComment", "QOGamVcvLPz"],
      icon: PERMISSION,
    },
    {
      label: "Dependent Children Under 12 Years of Age",
      keys: ["hasKids", "Bpce3m4do80"],
      type: "boolean" as const,
      commentKeys: ["hasKidsComment", "i3RptmIeSwR"],
      icon: KIDS,
    },
    {
      label: "Chronic / Untreated Diseases or Disabilities",
      keys: ["hasUnattendedDeformities", "RpNKpAufHbn"],
      type: "boolean" as const,
      commentKeys: ["hasUnattendedDeformitiesComment", "HtW0OMmthFQ"],
      icon: CROSS,
    },
    {
      label: "Alcohol, Drugs or Mind-altering Substances (Past 2 Years)",
      keys: ["fyV0EfY0dnR"],
      type: "boolean" as const,
      commentKeys: ["la4960WBUC3"],
      icon: BEER,
    },
    {
      label: "Stress or Other Mental Health Problems",
      keys: ["hasStress", "dgky5acnvG3"],
      type: "boolean" as const,
      commentKeys: ["hasStressComment", "Mp6LLGv4WOT"],
      icon: STRESS,
    },
    {
      label: "Serious Legal Litigations or Unsettled Obligations",
      keys: ["g1QmlpA14bX"],
      type: "boolean" as const,
      commentKeys: ["GL9bAKX2wl3"],
      icon: LAW,
    },
    {
      label: "Pre-existing Chronic Illnesses (Asthma, Epilepsy, cysts, boils, etc.)",
      keys: ["iaW1GDx6k3P"],
      type: "boolean" as const,
      commentKeys: ["nOm8SVX2VbC"],
      icon: CHRONIC_ILLNESS,
    },
    {
      label: "Physical Body Deformities (Amputated limbs, etc.)",
      keys: ["nwItPNW72se"],
      type: "boolean" as const,
      commentKeys: ["aHZ7BJDzntQ"],
      icon: AMPUTEE,
    },
    {
      label: "Past Involvement with Most Ven. Gnanavimala Maha Thero or Most Ven. Bambalapitiye Gnanaloka Thero",
      keys: ["rrXapwmqJ3D"],
      type: "text" as const,
    },
    {
      label: "Details of Pre-existing Medical Conditions / Disabilities",
      keys: ["F2b0gJpgjLp"],
      type: "text" as const,
    },
    {
      label: "Current Treatments / Administered Medications",
      keys: ["nTi2kp2C0v8"],
      type: "text" as const,
    },
    {
      label: "Other Personal, Financial, Social or Legal Challenges",
      keys: ["iGNQ7t4qvcM"],
      type: "text" as const,
    }
  ];

  const dhammaPractices = (() => {
    const practices: string[] = [];

    // Samanera/Upasampada
    const maritalStateVal = getValue(["maritalState", "B08mfPKrUiM"]);
    if (maritalStateVal === "reverend") {
      const virtueVal = getValue(["VirtueObserved"]);
      if (virtueVal) {
        practices.push(`Observed Virtue: ${virtueVal}`);
      }
      const yearOrd = getValue(["MCCX4BAduLq"]);
      if (yearOrd) {
        practices.push(`Ordained in Year: ${yearOrd}`);
      }
      const vassa = getValue(["pUPux4ovXEA"]);
      if (vassa) {
        practices.push(`Vassa Count: ${vassa}`);
      }
    }

    // Objective / Goals
    const ordinationInt = getValue(["kT2ExGjYbPS"]);
    if (ordinationInt === true || String(ordinationInt).toLowerCase() === "true" || String(ordinationInt).toLowerCase() === "yes") {
      practices.push("Intends Ordination");
    }

    // Agreements
    const noPhones = getValue(["EJaujr9wSTz"]);
    if (noPhones === true || String(noPhones).toLowerCase() === "true" || String(noPhones).toLowerCase() === "yes") {
      practices.push("Agreed to Keep Phones Away");
    }

    // Dhamma Checks
    const noBadHabits = getValue(["ThRvZed4wxU"]);
    if (noBadHabits === true || String(noBadHabits).toLowerCase() === "true" || String(noBadHabits).toLowerCase() === "yes") {
      practices.push("No Bad Habits");
    }

    const readFourNoble = getValue(["wbllYsatR5l"]);
    if (readFourNoble === true || String(readFourNoble).toLowerCase() === "true" || String(readFourNoble).toLowerCase() === "yes") {
      practices.push("Read Four Noble Truths");
    }

    const trividaRathna = getValue(["q6N0kD78IS9"]);
    if (trividaRathna === true || String(trividaRathna).toLowerCase() === "true" || String(trividaRathna).toLowerCase() === "yes") {
      practices.push("Understands Trivida Rathna");
    }

    const ashuba = getValue(["DZgJUDEYKvH"]);
    if (ashuba === true || String(ashuba).toLowerCase() === "true" || String(ashuba).toLowerCase() === "yes") {
      practices.push("Practices Ashuba Bhavana");
    }

    const maithree = getValue(["ZnRv3kNDmun"]);
    if (maithree === true || String(maithree).toLowerCase() === "true" || String(maithree).toLowerCase() === "yes") {
      practices.push("Practices Maithree Bhavana");
    }

    return practices;
  })();

  // Find unmapped attributes
  const otherAttributesList: { label: string; value: any }[] = [];
  const knownKeys = new Set([
    "fullName", "fvk2p04ylAA", "MMb2cXBOrSY", "dob", "oZkvTN1dcPw", "gender", "tuKFO1uF5x5",
    "maritalState", "B08mfPKrUiM", "nic", "W1fmUMMnQdu", "passport", "hv3aLM80Mrn", "EDhjneO1ofm",
    "lByRbJqnG5q", "ywoMYb2bCz5", "mobile", "lLXB9cYYgEP", "ZRXiTWo2Vbq", "CpF36JSasMJ",
    "EDMGB8x9lc3", "priority", "NgHvHow9RZs", "uYHVvgUT65S", "duD6vVqtSCq", "KxFKodUg1kx",
    "wOpDOCpAxuv", "EJaujr9wSTz", "kT2ExGjYbPS", "MCCX4BAduLq", "pUPux4ovXEA", "ThRvZed4wxU",
    "wbllYsatR5l", "q6N0kD78IS9", "DZgJUDEYKvH", "ZnRv3kNDmun", "hasStress", "dgky5acnvG3",
    "hasStressComment", "Mp6LLGv4WOT", "iaW1GDx6k3P", "nOm8SVX2VbC", "F2b0gJpgjLp", "nTi2kp2C0v8",
    "nwItPNW72se", "aHZ7BJDzntQ", "hasUnattendedDeformities", "RpNKpAufHbn", "hasUnattendedDeformitiesComment",
    "HtW0OMmthFQ", "fyV0EfY0dnR", "la4960WBUC3", "g1QmlpA14bX", "GL9bAKX2wl3", "hasKids",
    "Bpce3m4do80", "hasKidsComment", "i3RptmIeSwR", "hasPermission", "QGXYhZMXfnc",
    "hasPermissionComment", "QOGamVcvLPz", "rrXapwmqJ3D", "iGNQ7t4qvcM", "zMtxZwR7Kw5", "VirtueObserved"
  ]);

  Object.entries(yogi.attributes).forEach(([key, value]) => {
    if (!knownKeys.has(key) && typeof value !== "object" && value !== undefined && value !== null && value !== "") {
      otherAttributesList.push({
        label: key,
        value: value,
      });
    }
  });

  return (
    <div className={`proposed-yogi-detail-card ${isReverend ? "reverend-card" : ""}`}>
      <div className="detail-header">
        <div className="header-left">
          <div className="yogi-title-section">
            <h2 className="yogi-name">{yogi.attributes.fullName}</h2>
            {isReverend && <span className="reverend-badge">Reverend</span>}
            <Button
              small
              onClick={() => {
                const tempElement = document.createElement("a");
                tempElement.href = baseUrl;
                window.open(
                  new URL(
                    `dhis-web-tracker-capture/index.html#/dashboard?tei=${yogi.id}&program=${DHIS_PROGRAM}&ou=${DHIS2_ROOT_ORG}`,
                    tempElement.href,
                  ).toString(),
                  "_blank",
                );
              }}
              title="Open in Tracker Capture"
            >
              <BiLinkExternal />
            </Button>
          </div>
          <div className="yogi-meta-summary-text">
            {yogi.attributes.gender ? String(yogi.attributes.gender).toUpperCase() : "GENDER NOT SPECIFIED"} • {yogi.attributes.dob ? `AGE ${Math.floor((Date.now() - new Date(yogi.attributes.dob).getTime()) / 31557600000)}` : "AGE NOT SPECIFIED"}
          </div>
        </div>

        <div className="header-right">
          <div className="header-actions">
            <ProposedActions yogi={yogi} retreat={retreat} />
          </div>
          <Tooltip
            content={
              <div className="yogi-score-tooltip">
                <YogiScoreTooltip total={total} breakdown={breakdown} />
              </div>
            }
          >
            <div className="score-badge-circle">
              <span className="score-badge-label">Score</span>
              <span className="score-badge-value">{total}</span>
            </div>
          </Tooltip>
        </div>
      </div>

      <div className="detail-body-layout">
        <div className="body-column-left">
          {/* Card 6: Applications */}
          <div className="profile-dashboard-card">
            <div className="card-header-icon-title">
              <span className="card-icon">📊</span>
              <h3 className="card-title">Applications</h3>
            </div>
            <div className="indicators-grid-layout">
              <div className="indicator-item-dashboard">
                <span className="label">Active Applications</span>
                <div className="indicator-value-container">
                  <ActiveApplicationIndicator currentRetreat={retreat} trackedEntity={yogi} />
                </div>
              </div>
              <div className="indicator-item-dashboard">
                <span className="label">Participation History</span>
                <div className="indicator-value-container">
                  <ParticipationIndicator trackedEntity={yogi} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 7: Comments & Notes */}
          <div className="comments-notes-row-dashboard">
            {/* Special Comments */}
            <div className="profile-dashboard-card flex-grow">
              <div className="card-header-icon-title">
                <span className="card-icon">💬</span>
                <h3 className="card-title">Special Comments</h3>
              </div>
              {comments.length > 0 ? (
                <div className="yogi-comment-container full-view-comment">
                  <div className="yogi-comment-header">
                    <span className="yogi-comment-badge">Comment</span>
                    <span className="yogi-comment-date">
                      {new Date(comments[currentCommentIndex].occurredAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {comments.length > 1 && (
                      <div className="yogi-comment-nav">
                        <Button
                          small
                          secondary
                          disabled={currentCommentIndex === 0}
                          onClick={() => setCurrentCommentIndex((prev) => prev - 1)}
                        >
                          <BiChevronLeft />
                        </Button>
                        <span className="yogi-comment-counter">
                          {currentCommentIndex + 1} of {comments.length}
                        </span>
                        <Button
                          small
                          secondary
                          disabled={currentCommentIndex === comments.length - 1}
                          onClick={() => setCurrentCommentIndex((prev) => prev + 1)}
                        >
                          <BiChevronRight />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="yogi-comment-body">
                    {comments[currentCommentIndex].comment}
                  </div>
                </div>
              ) : (
                <div className="empty-section-message">No special comments.</div>
              )}
            </div>

            {/* Internal Staff Notes */}
            <div className="profile-dashboard-card flex-grow">
              <div className="card-header-icon-title">
                <span className="card-icon">📌</span>
                <h3 className="card-title">Internal Staff Notes</h3>
              </div>
              {staffNotes.length > 0 ? (
                <div className="yogi-comment-container full-view-comment">
                  <div className="yogi-comment-header">
                    <span className="yogi-staff-note-badge">Internal Note</span>
                    {staffNotes[currentNoteIndex].storedAt && (
                      <span className="yogi-comment-date">
                        {new Date(staffNotes[currentNoteIndex].storedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    {staffNotes[currentNoteIndex].createdBy?.username && (
                      <span className="yogi-comment-author">
                        By {staffNotes[currentNoteIndex].createdBy.username}
                      </span>
                    )}
                    {staffNotes.length > 1 && (
                      <div className="yogi-comment-nav">
                        <Button
                          small
                          secondary
                          disabled={currentNoteIndex === 0}
                          onClick={() => setCurrentNoteIndex((prev) => prev - 1)}
                        >
                          <BiChevronLeft />
                        </Button>
                        <span className="yogi-comment-counter">
                          {currentNoteIndex + 1} of {staffNotes.length}
                        </span>
                        <Button
                          small
                          secondary
                          disabled={currentNoteIndex === staffNotes.length - 1}
                          onClick={() => setCurrentNoteIndex((prev) => prev + 1)}
                        >
                          <BiChevronRight />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="yogi-comment-body">
                    {staffNotes[currentNoteIndex].value}
                  </div>
                </div>
              ) : (
                <div className="empty-section-message">No internal staff notes.</div>
              )}
            </div>
          </div>

          {/* Card 1: Yogi Profile */}
          <div className="profile-dashboard-card">
            <div className="card-header-icon-title">
              <span className="card-icon">🪪</span>
              <h3 className="card-title">Yogi Profile</h3>
            </div>

            <div className="profile-details-section">
              <div className="detail-subsection">
                <h4 className="subsection-title-tiny">Demographics & Profile</h4>
                <div className="details-list">
                  <div className="details-row">
                    <span className="label">Full Name</span>
                    <span className="val">{yogi.attributes.fullName || "Not provided"}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Name with Initials</span>
                    <span className="val">{String(getValue(["MMb2cXBOrSY"]) || "Not provided")}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Gender</span>
                    <span className="val" style={{ textTransform: "capitalize" }}>{yogi.attributes.gender || "Not provided"}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Date of Birth</span>
                    <span className="val">
                      {yogi.attributes.dob ? `${new Date(yogi.attributes.dob).toLocaleDateString()} (Age: ${Math.floor((Date.now() - new Date(yogi.attributes.dob).getTime()) / 31557600000)})` : "Not provided"}
                    </span>
                  </div>
                  {yogi.attributes.maritalState && (
                    <div className="details-row">
                      <span className="label">Status</span>
                      <span className="val" style={{ textTransform: "capitalize" }}>{yogi.attributes.maritalState}</span>
                    </div>
                  )}
                  {yogi.attributes.profession && (
                    <div className="details-row">
                      <span className="label">Profession</span>
                      <span className="val">{yogi.attributes.profession}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-subsection">
                <h4 className="subsection-title-tiny">Identity Documents</h4>
                <div className="details-list">
                  <div className="details-row">
                    <span className="label">NIC</span>
                    <span className="val">{yogi.attributes.nic || "Not provided"}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Passport</span>
                    <span className="val">{yogi.attributes.passport || "Not provided"}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Primary ID</span>
                    <span className="val">{String(getValue(["EDhjneO1ofm"]) || "Not provided")}</span>
                  </div>
                </div>
              </div>

              <div className="detail-subsection">
                <h4 className="subsection-title-tiny">Contact Details</h4>
                <div className="details-list">
                  <div className="details-row">
                    <span className="label">Mobile Phone</span>
                    <span className="val">{yogi.attributes.mobile || "Not provided"}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Home Phone</span>
                    <span className="val">{String(getValue(["ZRXiTWo2Vbq"]) || "Not provided")}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Whatsapp</span>
                    <span className="val">{String(getValue(["CpF36JSasMJ"]) || "Not provided")}</span>
                  </div>
                  <div className="details-row">
                    <span className="label">Email</span>
                    <span className="val">{String(getValue(["lByRbJqnG5q"]) || "Not provided")}</span>
                  </div>
                  <div className="details-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                    <span className="label">Residential Address</span>
                    <span className="val" style={{ textAlign: "left", fontSize: "12px", background: "var(--color-grey-050)", padding: "6px 10px", borderRadius: "var(--radius-s)", width: "100%", border: "1px solid var(--color-grey-200)" }}>
                      {String(getValue(["ywoMYb2bCz5"]) || "Not provided")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Card 3: Other Details */}
          {otherAttributesList.length > 0 && (
            <div className="profile-dashboard-card">
              <div className="card-header-icon-title">
                <span className="card-icon">📝</span>
                <h3 className="card-title">Other Details</h3>
              </div>
              <div className="details-list">
                {otherAttributesList.map((attr) => (
                  <div className="details-row" key={attr.label}>
                    <span className="label" style={{ fontSize: "11px" }}>{attr.label}</span>
                    <span className="val" style={{ fontSize: "12px" }}>{String(attr.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="body-column-right">
          {/* Card 5: Physical & Psychological Readiness */}
          <div className="profile-dashboard-card">
            <div className="card-header-icon-title">
              <span className="card-icon">❤️‍🩹</span>
              <h3 className="card-title">Physical & Psychological Readiness</h3>
            </div>

            <div className="readiness-questions-list">
              {readinessQuestions.map((q, idx) => {
                const val = getValue(q.keys);
                const hasValue = val !== null && val !== undefined && val !== "";
                const isTrue = hasValue && (String(val).toLowerCase() === "true" || val === true || val === "1" || val === 1 || String(val).toLowerCase() === "yes");

                if (q.type === "text" && !hasValue) {
                  return null; // Don't show empty optional text fields
                }

                let displayVal = "Not provided";
                if (hasValue) {
                  if (q.type === "boolean") {
                    displayVal = isTrue ? "Yes" : "No";
                  } else {
                    displayVal = String(val);
                  }
                } else if (q.type === "boolean") {
                  displayVal = "No"; // Default to No if boolean check is empty
                }

                const commentVal = q.commentKeys ? getValue(q.commentKeys) : null;

                return (
                  <div className="readiness-question-item" key={idx}>
                    <div className="readiness-question-row">
                      <div className="readiness-question-left">
                        {q.icon && (
                          <img
                            src={q.icon}
                            alt={q.label}
                            className="readiness-indicator-icon"
                          />
                        )}
                        <span className="readiness-question-label">{q.label}</span>
                      </div>
                      {q.type === "boolean" && (
                        <div className="readiness-question-right">
                          <span className={`readiness-badge-pill ${isTrue ? "pill-yes" : "pill-no"}`}>
                            {displayVal}
                          </span>
                        </div>
                      )}
                    </div>
                    {q.type === "text" && (
                      <div className="readiness-text-answer">
                        {displayVal}
                      </div>
                    )}
                    {commentVal && (
                      <div className="readiness-comment-box">
                        <strong className="comment-prefix">Explanation: </strong>
                        <span className="comment-quote">"{String(commentVal)}"</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Dhamma Practice */}
          <div className="profile-dashboard-card dhamma-card-style">
            <div className="card-header-icon-title">
              <span className="card-icon">🧘</span>
              <h3 className="card-title">Spiritual Pursuits</h3>
            </div>

            {getValue(["KxFKodUg1kx"]) && (
              <div className="dhamma-objective-quote">
                <span className="quote-label">RETREAT OBJECTIVE:</span>
                <p className="quote-text">"{String(getValue(["KxFKodUg1kx"]))}"</p>
              </div>
            )}

            <div className="dhamma-badges-container">
              {dhammaPractices.length > 0 ? (
                dhammaPractices.map((practice) => (
                  <span key={practice} className="dhamma-badge-tag">
                    ✓ {practice}
                  </span>
                ))
              ) : (
                <div className="empty-section-message">No spiritual commitments specified.</div>
              )}
            </div>
          </div>

          {/* Card 2: Emergency Contact */}
          {getValue(["NgHvHow9RZs"]) && (
            <div className="profile-dashboard-card">
              <div className="card-header-icon-title">
                <span className="card-icon">🚨</span>
                <h3 className="card-title">Emergency Contact</h3>
              </div>
              <div className="emergency-contact-box">
                <div className="contact-avatar">🚨</div>
                <div className="contact-info">
                  <span className="contact-name">{String(getValue(["NgHvHow9RZs"]))}</span>
                  <span className="contact-relationship">
                    Relationship: <strong>{String(getValue(["duD6vVqtSCq"]) || "Not specified")}</strong>
                  </span>
                  <span className="contact-phone">
                    Phone: <strong>{String(getValue(["uYHVvgUT65S"]) || "Not provided")}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}




        </div>
      </div>


    </div>
  );
});
