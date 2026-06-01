-- SQL Views for Dashboard Statistics

-- View 1: Participation Dump
-- Returns: yogi_id, retreat_code
-- Used to calculate: Total General Participants, One-time vs Repeat, Missed
-- Name: DASHBOARD_PARTICIPATION_DUMP
SELECT
    tei.uid as yogi_uid,
    psi.eventdatavalues -> 'rYqV3VQu7LS' ->> 'value' as retreat_code
FROM programstageinstance psi
JOIN programinstance pi ON psi.programinstanceid = pi.programinstanceid
JOIN trackedentityinstance tei ON pi.trackedentityinstanceid = tei.trackedentityinstanceid
WHERE psi.programstageid = (SELECT programstageid FROM programstage WHERE uid = 'NYxnKQd6goA') -- Participation Stage
  AND psi.deleted = false
  AND psi.eventdatavalues -> 'CzwVwJ30hTj' ->> 'value' = 'true'; -- Only count if marked as attended

-- View 2: Expression of Interest (EOI) Dump
-- Returns: yogi_uid, retreat_code, state, invitation_sent, gender
-- Name: DASHBOARD_EOI_DUMP
SELECT
    tei.uid as yogi_uid,
    psi.eventdatavalues -> 'rYqV3VQu7LS' ->> 'value' as retreat_code,
    psi.eventdatavalues -> 'MVaziT78i7p' ->> 'value' as state,
    psi.eventdatavalues -> 'UkXg5kMsDBH' ->> 'value' as invitation_sent,
    teav.value as gender
FROM programstageinstance psi
JOIN programinstance pi ON psi.programinstanceid = pi.programinstanceid
JOIN trackedentityinstance tei ON pi.trackedentityinstanceid = tei.trackedentityinstanceid
LEFT JOIN trackedentityattributevalue teav ON tei.trackedentityinstanceid = teav.trackedentityinstanceid 
  AND teav.trackedentityattributeid = (SELECT trackedentityattributeid FROM trackedentityattribute WHERE uid = 'tuKFO1uF5x5')
WHERE psi.programstageid = (SELECT programstageid FROM programstage WHERE uid = 'BLn1j2VgLZf') -- EOI Stage
  AND psi.deleted = false;
