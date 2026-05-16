import {
  Pagination,
  Table,
  TableBody,
  TableHead,
  TableCellHead,
  TableRowHead,
} from "@dhis2/ui";
import React from "react";
import YogiRow from "./YogiRow";
import {
  DHIS2_RETREAT_SELECTION_STATE_PENDING_CONFIRMATION_CODE,
  DHIS2_RETREAT_SELECTION_STATE_SELECTED_CODE,
} from "../../dhis2";
import {
  AttendanceButton,
  InvitationIndicator,
  RoomSelect,
  StateChangeButton,
} from "./YogiRowActions";
import { Retreat, Yogi } from "../../types/domain";

interface YogiTableProps {
  filteredYogis: Yogi[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  retreat: Retreat;
  selectionState: string;
  allYogis: Yogi[];
}

const YogiTable = ({
  filteredYogis,
  currentPage,
  pageSize,
  onPageChange,
  retreat,
  selectionState,
  allYogis,
}: YogiTableProps) => {
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
      {renderPagination(filteredYogis.length)}
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
            {filteredYogis.map((yogi, index) => {
              if (
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
                  actions={
                    <>
                      <StateChangeButton
                        yogi={yogi}
                        currentState={selectionState}
                        retreat={retreat}
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
                  }
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
      {renderPagination(filteredYogis.length)}
    </div>
  );
};

export default YogiTable;
