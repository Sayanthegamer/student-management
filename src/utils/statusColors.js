/**
 * Shared status color mappings used across AdmissionCard, AdmissionStatus,
 * and other components that display admission status visuals.
 *
 * Uses CSS custom properties so colors adapt to the active theme.
 */

// Tailwind utility classes for status badge styling
export const statusStyles = {
  Provisional: 'bg-amber-50 text-amber-700 border-amber-200',
  Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  Transferred: 'bg-purple-50 text-purple-700 border-purple-200',
};

// Hex colors for progress bars, border-top accents, and icon tinting
// in contexts where inline `style` objects are needed (e.g. StatusColumn).
export const statusHexColors = {
  Confirmed: '#059669',
  Provisional: '#d97706',
  Cancelled: '#e11d48',
  Transferred: '#9333ea',
};
