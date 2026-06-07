import { ADMIN_WHITELIST } from "../config/admin";

// Reads the persisted Zustand auth session (stored under 'anchorsoft-auth').
// Returns the user object { id, email } or null.
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("anchorsoft-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user ?? null;
  } catch {
    return null;
  }
};

// Non-reactive helper — use AdminRoute (which reads from the Zustand hook)
// inside components; use this only outside of React (e.g. utils, guards).
export const isAdminUser = () => {
  const user = getCurrentUser();
  if (!user?.email) return false;
  // Future-ready: accept role === "admin" OR email on the whitelist
  return user?.role === "admin" || ADMIN_WHITELIST.includes(user.email);
};
