import {
  Pagination,
  Table,
  TableBody,
  TableHead,
  TableCellHead,
  TableRowHead,
  TableRow,
  TableCell,
} from "@dhis2/ui";
import React from "react";
import YogiRow from "./YogiRow";
import {
  DHIS2_RETREAT_SELECTION_STATE_PENDING_CONFIRMATION_CODE,
  DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE,
} from "../../dhis2";
import { useStore } from "../../stores/StoreProvider";
import {
  AttendanceButton,
  InvitationIndicator,
  RoomSelect,
  StateChangeButton,
  ProposedActions,
} from "./YogiRowActions";
import { Retreat, Yogi, EoiSummary } from "../../types/domain";

interface YogiTableProps {
  filteredYogis: Yogi[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  retreat: Retreat;
  selectionState: string;
  allYogis: Yogi[];
  allRetreats: Retreat[];
  eoiSummary: EoiSummary[];
}

const YogiTable = ({
  filteredYogis,
  currentPage,
  pageSize,
  onPageChange,
  retreat,
  selectionState,
  allYogis,
  allRetreats,
  eoiSummary,
}: YogiTableProps) => {
  const store = useStore();
  const stateObj = (store.metadata?.selectionStates || []).find((s) => s.code === selectionState);
  const stateName = stateObj?.name || selectionState;

  const renderPagination = (total: number) => (
    <Pagination
      page={currentPage}
      pageCount={Math.ceil(total / pageSize)}
      pageSize={pageSize}
      total={total}
      hidePageSizeSelect
      onPageChange={onPageChange}
      className="pagination"
    />
  );

  return (
    <div>
      {selectionState !== "proposed" && renderPagination(filteredYogis.length)}
      <div className="yogi-table-container">
        <Table className="yogi-table">
          <TableHead>
            <TableRowHead>
              <TableCellHead>Profile</TableCellHead>
              <TableCellHead width="100px">Indicators</TableCellHead>
              <TableCellHead width="250px">Applications</TableCellHead>
              <TableCellHead width="150px">Participation</TableCellHead>
              {!retreat.finalized && (
                <TableCellHead width="160px">Action</TableCellHead>
              )}
            </TableRowHead>
          </TableHead>
          <TableBody>
            {filteredYogis.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <div style={{ padding: "30px", color: "var(--color-grey-600)" }}>
                    {selectionState === "proposed"
                      ? "No proposed yogi available for this gender selection."
                      : `No yogis found in ${stateName}.`}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredYogis.map((yogi, index) => {
                if (
                  selectionState !== "proposed" &&
                  !(
                    index >= (currentPage - 1) * pageSize &&
                    index < currentPage * pageSize
                  )
                ) {
                  return null;
                }

                return (
                  <YogiRow
                    trackedEntity={yogi}
                    key={yogi.id}
                    currentRetreat={retreat}
                    allRetreats={allRetreats}
                    eoiSummary={eoiSummary}
                    actions={
                      selectionState === "proposed" ? (
                        <ProposedActions yogi={yogi} retreat={retreat} />
                      ) : (
                        <>
                          <StateChangeButton
                            yogi={yogi}
                            currentState={selectionState}
                            retreat={retreat}
                            allYogis={allYogis}
                          />
                          {selectionState ===
                          DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE ? (
                            <RoomSelect
                              retreat={retreat}
                              yogi={yogi}
                              allYogis={allYogis}
                            />
                          ) : null}
                          {selectionState ===
                          DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE ? (
                            <AttendanceButton retreat={retreat} yogi={yogi} />
                          ) : null}
                          {selectionState ===
                          DHIS2_RETREAT_SELECTION_STATE_PENDING_CONFIRMATION_CODE ? (
                            <InvitationIndicator
                              retreat={retreat}
                              yogi={yogi}
                            />
                          ) : null}
                        </>
                      )
                    }
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {selectionState !== "proposed" && renderPagination(filteredYogis.length)}
    </div>
  );
};

export default YogiTable;
