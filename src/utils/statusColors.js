/**
 * Shared status color mappings used across AdmissionCard, AdmissionStatus,
 * and other components that display admission status visuals.
 *
 * Uses CSS custom properties so colors adapt to the active theme.
 */

// Tailwind utility classes for status badge styling (theme-aware via CSS vars)
export const statusStyles = {
  Provisional: 'bg-amber-500/10 text-amber-400 border-amber-500/20 rounded-md',
  Confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-md',
  Cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20 rounded-md',
  Exited: 'bg-violet-500/10 text-violet-400 border-violet-500/20 rounded-md',
};

// Color values for progress bars, border-top accents, and icon tinting
// in contexts where inline `style` objects are needed (e.g. StatusColumn).
// Falls back to literal hex if CSS var is unavailable.
export const statusHexColors = {
  Confirmed: 'var(--color-status-confirmed, #10b981)',
  Provisional: 'var(--color-status-provisional, #f59e0b)',
  Cancelled: 'var(--color-status-cancelled, #f43f5e)',
  Exited: 'var(--color-status-exited, #a855f7)',
};
