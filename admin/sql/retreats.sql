/*
 This implementation leverages the 'optionSet' to manage retreats. The following query
 avoids the need to load all options (including historical ones), as the DHIS2 'optionSet'
 endpoint currently lacks filtering by attribute values (e.g., date).
 */
with retreats_optionset as
(
select
	optionsetid
from
	optionset o
where
	o.code = 'Retreat'
),
retreat_date_attribute as (
select
	uid
from
	attribute a
where
	a.code = 'RetreatDate'
)
select
	ov.uid as id,
	ov.code as code,
	ov.name as name,
	jsonb_object_agg(
        av.key,
	(value->>'value')::text
    ) as attributeValues,
   CASE
        WHEN ((ov.attributevalues->(
                SELECT
                    uid
                FROM
                    retreat_date_attribute
            ))->>'value')::date > CURRENT_DATE - interval '14 days' THEN true
        ELSE false
    END AS current
from
	optionvalue ov
join lateral jsonb_each(ov.attributevalues) av on
	true
where
	ov.optionsetid = (
	select
		optionsetid
	from
		retreats_optionset)
group by
	ov.uid,
	ov.code,
	ov.name,
	current
limit 100