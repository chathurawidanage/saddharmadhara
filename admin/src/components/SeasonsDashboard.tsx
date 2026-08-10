import { Button, Tag, SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiAlertCircle,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiGlobe,
  FiLayers,
  FiMapPin,
  FiMessageSquare,
  FiPlus,
  FiUsers,
} from "react-icons/fi";
import { useStore } from "../stores/StoreProvider";
import RetreatLocation from "./RetreatLocation";
import SeasonModal from "./SeasonModal";
import RetreatModal from "./RetreatModal";
import GeneralRetreatStatsPanel from "./dashboard/GeneralRetreatStatsPanel";
import "./SeasonsDashboard.css";
import { Retreat, Season } from "../types/domain";

const getTypeColor = (type: string | null | undefined) => {
  const normalizedType = type?.toLowerCase() || "";
  if (normalizedType.includes("silent")) return "#6610f2"; // Purple
  if (normalizedType.includes("general")) return "#28a745"; // Green
  return "#6c757d"; // Gray default
};

interface GroupedSeason extends Season {
  retreats: Retreat[];
}

const SeasonsDashboard = observer(() => {
  const store = useStore();
  const navigate = useNavigate();
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [createRetreatSeason, setCreateRetreatSeason] = useState<Season | null>(null);
  const [expandedSeasons, setExpandedSeasons] = useState<Record<string, boolean>>({});

  if (!store.metadata) return null;

  const toggleSeason = (code: string) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  // Group retreats by season
  const seasonsMap: Record<string, GroupedSeason> = {};

  store.metadata.seasons.forEach((season: Season) => {
    seasonsMap[season.code] = {
      ...season,
      retreats: [],
    };
  });

  const unassignedRetreats: Retreat[] = [];

  store.metadata.retreats.forEach((retreat: Retreat) => {
    if (retreat.season && seasonsMap[retreat.season]) {
      seasonsMap[retreat.season].retreats.push(retreat);
    } else {
      unassignedRetreats.push(retreat);
    }
  });

  const activeSeasons = store.metadata.seasons.map((s: Season) => seasonsMap[s.code]);

  return (
    <div className="seasons-dashboard-container">
      <div className="dashboard-header-row">
        <div>
          <h2 className="dashboard-header-title">Saddharmadara Seasons</h2>
          <p className="dashboard-header-subtitle">
            Manage your meditation seasons and retreats
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button primary onClick={() => setShowSeasonModal(true)}>
            <FiPlus style={{ marginRight: "4px" }} /> Create Season
          </Button>
        </div>
      </div>

      {showSeasonModal && (
        <SeasonModal
          store={store}
          onCancel={() => setShowSeasonModal(false)}
        />
      )}

      {createRetreatSeason && (
        <RetreatModal
          preconfiguredSeason={createRetreatSeason}
          onCancel={() => setCreateRetreatSeason(null)}
        />
      )}

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card-wrapper">
          <div className="stat-title">SMS Credits</div>
          <div className="stat-value">
            {store.metadata.smsCredits ? `LKR ${store.metadata.smsCredits.balance}` : "..."}
          </div>
          <FiMessageSquare className="stat-icon" />
        </div>
        <div className="stat-card-wrapper">
          <div className="stat-title">Active Retreats</div>
          <div className="stat-value">{store.metadata.currentRetreats.length}</div>
          <FiActivity className="stat-icon" />
        </div>
        <div className="stat-card-wrapper">
          <div className="stat-title">Retreat Seasons</div>
          <div className="stat-value">{store.metadata.seasons.length}</div>
          <FiLayers className="stat-icon" />
        </div>
        <div className="stat-card-wrapper bg-danger-light">
          <div className="stat-title text-danger-custom">Non finalized Retreats</div>
          <div className="stat-value text-danger-custom">
            {store.metadata.retreats.filter((r) => !r.finalized).length}
          </div>
          <FiAlertCircle className="stat-icon text-danger-custom" />
        </div>
      </div>

      <GeneralRetreatStatsPanel store={store} />

      <h3 className="dashboard-section-title">Retreat Seasons</h3>

      {activeSeasons.length === 0 && unassignedRetreats.length === 0 && (
        <div className="no-data-card">
          <p>No seasons or retreats are currently set up. Start by creating a season!</p>
        </div>
      )}

      <div className="seasons-list">
        {activeSeasons.map((season) => {
          const isExpanded = expandedSeasons[season.code];
          const totalYogis = season.retreats.reduce(
            (sum, r) => sum + parseInt(r.totalYogis || 0),
            0
          );
          const finalizedCount = season.retreats.filter((r) => r.finalized).length;

          return (
            <div
              key={season.code}
              className={`season-card ${isExpanded ? "expanded" : ""}`}
              style={{ borderLeftColor: getTypeColor(season.retreatType) }}
            >
              <div className="season-card-header" onClick={() => toggleSeason(season.code)}>
                <div className="season-meta-info">
                  <span className="season-name">{season.name}</span>
                  <div className="season-tags">
                    <Tag>{season.retreatType?.toUpperCase()}</Tag>
                    {season.noOfDays && <Tag neutral>{season.noOfDays} Days</Tag>}
                    {season.medium && (
                      <Tag neutral>
                        <FiGlobe style={{ marginRight: "4px" }} />
                        {store.metadata?.languages?.find((l) => l.code === season.medium)?.name || season.medium}
                      </Tag>
                    )}
                    {season.startDate && (
                      <span className="season-date-badge">
                        <FiCalendar style={{ marginRight: "4px" }} />
                        Starts:{" "}
                        {season.startDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="season-quick-stats">
                  <div className="quick-stat">
                    <strong>{season.retreats.length}</strong> Retreats
                  </div>
                  <div className="quick-stat">
                    <strong>{totalYogis}</strong> Yogis
                  </div>
                  <div className="quick-stat">
                    <strong>{finalizedCount}/{season.retreats.length}</strong> Finalized
                  </div>
                  <span className="expand-chevron">
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="season-card-content">
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                    <Button primary onClick={() => setCreateRetreatSeason(season)}>
                      <FiPlus style={{ marginRight: "4px" }} /> Create Retreat
                    </Button>
                  </div>
                  {season.retreats.length === 0 ? (
                    <p className="no-retreats-msg">No retreats linked to this season yet. Click above to create one!</p>
                  ) : (
                    <div className="retreats-table-container">
                      <table className="retreats-table">
                        <thead>
                          <tr>
                            <th>Retreat Name</th>
                            <th>Code</th>
                            <th>Dates</th>
                            <th>Duration</th>
                            <th>Location</th>
                            <th>Yogis</th>
                            {store.metadata.isAdmin && <th style={{ width: "180px" }}>Season</th>}
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {season.retreats.map((retreat) => {
                            const plusDateTo = new Date(retreat.endDate);
                            plusDateTo.setDate(plusDateTo.getDate() + 1);

                            return (
                              <tr key={retreat.id}>
                                <td className="retreat-cell-name">{retreat.name}</td>
                                <td><Tag>{retreat.retreatCode}</Tag></td>
                                <td>
                                  {retreat.date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}{" "}
                                  -{" "}
                                  {plusDateTo.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </td>
                                <td>{retreat.noOfDays} Days</td>
                                <td>
                                  <RetreatLocation locationId={retreat.location} />
                                </td>
                                <td>{retreat.totalYogis}</td>
                                {store.metadata.isAdmin && (
                                  <td>
                                    <SingleSelectField
                                      dense
                                      selected={retreat.season || ""}
                                      onChange={({ selected }: { selected: string }) => {
                                        store.metadata?.assignSeasonToRetreat(retreat, selected);
                                      }}
                                      tabIndex="0"
                                    >
                                      <SingleSelectOption label="Unassigned" value="" />
                                      {(store.metadata?.seasons || []).map((s: Season) => (
                                        <SingleSelectOption key={s.code} label={s.name} value={s.code} />
                                      ))}
                                    </SingleSelectField>
                                  </td>
                                )}
                                <td>
                                  <div style={{ display: "flex", gap: "4px" }}>
                                    {retreat.finalized && (
                                      <Tag positive bold>
                                        Finalized
                                      </Tag>
                                    )}
                                    <Tag positive={!retreat.disabled} negative={retreat.disabled}>
                                      {retreat.disabled ? "Disabled" : "Active"}
                                    </Tag>
                                  </div>
                                </td>
                                <td>
                                  <Button
                                    small
                                    primary
                                    onClick={() => navigate(`/retreats/${retreat.id}`)}
                                  >
                                    Manage
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Unassigned Retreats Section */}
        {unassignedRetreats.length > 0 && (
          <div className={`season-card unassigned ${expandedSeasons["unassigned"] ? "expanded" : ""}`}>
            <div
              className="season-card-header"
              onClick={() => toggleSeason("unassigned")}
            >
              <div className="season-meta-info">
                <span className="season-name">Unassigned Retreats</span>
                <span className="season-subtitle">Retreats not linked to any season</span>
              </div>
              <div className="season-quick-stats">
                <div className="quick-stat">
                  <strong>{unassignedRetreats.length}</strong> Retreats
                </div>
                <span className="expand-chevron">
                  {expandedSeasons["unassigned"] ? <FiChevronUp /> : <FiChevronDown />}
                </span>
              </div>
            </div>

            {expandedSeasons["unassigned"] && (
              <div className="season-card-content">
                <div className="retreats-table-container">
                  <table className="retreats-table">
                    <thead>
                      <tr>
                        <th>Retreat Name</th>
                        <th>Code</th>
                        <th>Dates</th>
                        <th>Duration</th>
                        <th>Location</th>
                        <th>Yogis</th>
                        <th style={{ width: "180px" }}>Season</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unassignedRetreats.map((retreat) => {
                        const plusDateTo = new Date(retreat.endDate);
                        plusDateTo.setDate(plusDateTo.getDate() + 1);

                        return (
                          <tr key={retreat.id}>
                            <td className="retreat-cell-name">{retreat.name}</td>
                            <td><Tag>{retreat.retreatCode}</Tag></td>
                            <td>
                              {retreat.date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              -{" "}
                              {plusDateTo.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td>{retreat.noOfDays} Days</td>
                            <td>
                              <RetreatLocation locationId={retreat.location} />
                            </td>
                            <td>{retreat.totalYogis}</td>
                            <td>
                              <SingleSelectField
                                dense
                                selected={retreat.season || ""}
                                onChange={({ selected }) => {
                                  store.metadata.assignSeasonToRetreat(retreat, selected);
                                }}
                                tabIndex="0"
                              >
                                <SingleSelectOption label="Unassigned" value="" />
                                {store.metadata.seasons.map((s) => (
                                  <SingleSelectOption key={s.code} label={s.name} value={s.code} />
                                ))}
                              </SingleSelectField>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "4px" }}>
                                {retreat.finalized && (
                                  <Tag positive bold>
                                    Finalized
                                  </Tag>
                                )}
                                <Tag positive={!retreat.disabled} negative={retreat.disabled}>
                                  {retreat.disabled ? "Disabled" : "Active"}
                                </Tag>
                              </div>
                            </td>
                            <td>
                              <Button
                                small
                                primary
                                onClick={() => navigate(`/retreats/${retreat.id}`)}
                              >
                                Manage
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default SeasonsDashboard;
