-- Remove TC details column as the feature has been replaced by the "Mark as Exited" workflow
ALTER TABLE public.students DROP COLUMN IF EXISTS tc_details;
