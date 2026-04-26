/**
 * Standard monthly fee schedule by class.
 * Single source of truth — used by StudentForm, syncHelpers, FeePaymentModal.
 */
export const CLASS_FEES = {
  'Play School': '350',
  'Nursery': '440',
  'kg-1': '440',
  'kg-2': '440',
  '1': '480',
  '2': '490',
  '3': '510',
  '4': '520',
  '5': '540',
  '6': '560',
  '7': '580',
  '8': '600',
  '9': '650',
  '10': '700',
  '11': '800',
  '12': '900',
  'UG': '1500',
  'PG': '2000'
};

/**
 * Admission fee schedule by class.
 * Empty for now — user must enter manually during admission.
 * Fill in values here to auto-populate the admission fee field per class.
 * Example: 'Play School': '5000'
 */
export const ADMISSION_FEES = {
  // 'Play School': '',
  // 'Nursery': '',
  // Add values here when ready for auto-fill
};

/**
 * Promotion fee schedule by class (destination class).
 * Empty for now — user must enter manually during promotion.
 * Fill in values here to auto-populate the promotion fee field per destination class.
 */
export const PROMOTION_FEES = {
  // '1': '1500',
};

/**
 * Standard ordered progression of classes.
 * Used for automatic next-class calculation during student promotion.
 * @type {string[]}
 */
export const CLASS_ORDER = [
  'Play School',
  'Nursery',
  'kg-1',
  'kg-2',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  'UG',
  'PG'
];

/**
 * Get the next logical class for a given class.
 * Returns null if the current class is the highest or not found.
 *
 * @param {string} currentClass - The current class of the student.
 * @returns {string|null} The next class, or null if highest/not found.
 */
export const getNextClass = (currentClass) => {
  const currentIndex = CLASS_ORDER.indexOf(currentClass);
  if (currentIndex === -1 || currentIndex === CLASS_ORDER.length - 1) {
    return null;
  }
  return CLASS_ORDER[currentIndex + 1];
};

/**
 * Calculate late fine based on payment date vs monthly deadline (20th).
 *
 * Fine logic:
 * - Paid on or before the 20th of the fee month → ₹0
 * - Paid late within the same month → ₹30
 * - Paid in a later month → ₹50 × number of months late
 *
 * @param {string} month    - Fee month in YYYY-MM format
 * @param {string} payDate  - Payment date in YYYY-MM-DD format
 * @returns {number}        - Fine amount in ₹
 */
export const calculateFine = (month, payDate) => {
  if (!month || !payDate) return 0;

  const [year, monthNum] = month.split('-').map(Number);
  const paymentDate = new Date(payDate);
  const deadline = new Date(year, monthNum - 1, 20);

  // On time — no fine
  if (paymentDate <= deadline) return 0;

  // Late but within the same calendar month
  if (paymentDate.getFullYear() === year && paymentDate.getMonth() === monthNum - 1) {
    return 30;
  }

  // Paid in a later month — ₹50 per month of delay
  const paymentMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
  const dueMonth = new Date(year, monthNum - 1, 1);
  const monthsDiff = (paymentMonth.getFullYear() - dueMonth.getFullYear()) * 12
    + (paymentMonth.getMonth() - dueMonth.getMonth());

  return Math.max(0, 50 * monthsDiff);
};
