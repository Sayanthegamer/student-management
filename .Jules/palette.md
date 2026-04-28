# 2024-05-18 - [Redundant Accessibility Attributes]

**Learning:** Adding `aria-disabled="true"` to a native HTML `<button>` that already has the `disabled` attribute is redundant and slightly clutters the DOM without providing additional accessibility value, as screen readers naturally pick up the native attribute.
**Action:** Rely solely on the native `disabled` attribute along with visual styling (`opacity-50 cursor-not-allowed`) for standard button elements.
