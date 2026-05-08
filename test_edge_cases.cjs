import { useState } from 'react';

// Edge Case 1: What happens if admissionFee is undefined?
// grossAdmissionFee = Math.max(0, isNaN(Number(undefined)) ? 0 : Number(undefined)) = Math.max(0, NaN ? 0 : NaN) -> wait, Number(undefined) is NaN, isNaN(NaN) is true. It handles undefined cleanly.

// Edge Case 2: Negative concessionAmount or admissionFee?
// the Math.max(0, ...) clamps them to 0.

// Edge case 3: User changes to OLD, then changes to NEW again
// The state properly updates since changing to NEW re-evaluates ADMISSION_FEES based on class.

// The code looks solid. Let's reply to the PR comment.
