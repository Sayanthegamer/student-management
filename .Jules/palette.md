# 2024-05-18 - [Redundant Accessibility Attributes]

**Learning:** Adding `aria-disabled="true"` to a native HTML `<button>` that already has the `disabled` attribute is redundant and slightly clutters the DOM without providing additional accessibility value, as screen readers naturally pick up the native attribute.
**Action:** Rely solely on the native `disabled` attribute along with visual styling (`opacity-50 cursor-not-allowed`) for standard button elements.

## 2024-05-18 - Contextual ARIA Labels in Lists
**Learning:** Screen reader users lose context when navigating action buttons (like "Edit" or "Delete") out-of-context in repeating list or grid views. Generic `aria-label="Edit"` is insufficient.
**Action:** Always interpolate unique identifiers (like `student.name`) into the `aria-label` for action buttons inside `.map()` loops to meet WCAG 2.1 SC 2.4.4 (Link Purpose In Context) and ensure users know exactly what item they are modifying.

## 2024-05-18 - [Loading States for Async Buttons]

**Learning:** For asynchronous operations, it is critical to add a loading state to UI buttons that disable them and display an `aria-busy="true"` attribute alongside a visual spinner (e.g., `<Loader2 />`). This prevents multiple submissions and provides feedback to the screen reader.
**Action:** Always add `disabled` and `aria-busy` states to buttons performing asynchronous actions, accompanied by visual cues.
