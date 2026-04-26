/**
 * Shared status color mappings used across AdmissionCard, AdmissionStatus,
 * and other components that display admission status visuals.
 *
 * Uses CSS custom properties so colors adapt to the active theme.
 */

// Tailwind utility classes for status badge styling (theme-aware)
export const statusStyles = {
  Provisional: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Transferred: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

// Color values for progress bars, border-top accents, and icon tinting
// in contexts where inline `style` objects are needed (e.g. StatusColumn).
// Using theme-aware values that work with dark mode.
export const statusHexColors = {
  Confirmed: '#10b981',   // emerald-500
  Provisional: '#f59e0b', // amber-500
  Cancelled: '#f43f5e',   // rose-500
  Transferred: '#a855f7', // purple-500
};
