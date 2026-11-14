// What account deletion removes and checks. Every Parv table keyed by user id
// (discovered from supabase/*.sql and confirmed against the live schema). The
// Supabase project is shared with FitHit; none of its tables are ever written.
export const PARV_USER_TABLES = [
  "parv_family_notes",
  "parv_family_rituals",
  "parv_checklists",
  "parv_nudges_sent",
  "parv_profiles",
];

// Added by supabase/features-v4-cancel-feedback.sql; may not exist yet.
export const PARV_OPTIONAL_TABLES = ["parv_cancel_feedback"];

// Other apps sharing this Supabase project (and its sign-in users). Their
// foreign keys to auth.users are ON DELETE CASCADE, so deleting the shared auth
// user would erase their data. These tables are only COUNTED (read-only) to
// decide whether the sign-in may be deleted; they are never modified.
export const SHARED_APP_TABLES = ["fithit_days", "fithit_members", "fithit_settings"];

// Postgres "undefined table" / PostgREST "not in schema cache".
export const isMissingTable = (error) => error && (error.code === "42P01" || error.code === "PGRST205");
