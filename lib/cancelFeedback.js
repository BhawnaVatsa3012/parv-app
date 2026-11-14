// Exit-survey choices (stored by key). Keep in step with the check constraint in
// supabase/features-v4-cancel-feedback.sql.
export const CANCEL_REASONS = [
  { key: "too_expensive", label: "It costs too much" },
  { key: "not_using", label: "I'm not using it enough" },
  { key: "missing_content", label: "Something I wanted is missing" },
  { key: "found_alternative", label: "I found something else" },
  { key: "other", label: "Something else" },
];
export const CANCEL_COMMENT_MAX = 300;
export const cancelReasonKeys = CANCEL_REASONS.map((r) => r.key);
