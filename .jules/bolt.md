# 2024-04-29 - Extract Invariant Computations from Filter Loops
**Learning:** In components managing large arrays of data (e.g., up to 2000 students), performing redundant string operations like `.toLowerCase()` inside a `.filter()` loop creates an O(N) overhead. React's `useMemo` hooks update frequently on filter state changes, amplifying this overhead.
**Action:** Always hoist invariant string operations (like `toLowerCase()`) or data parsing before using filter, map, or sort to pre-calculate the value once per render cycle.

## 2024-05-15 - Memoize Expensive Operations in Polling Components
**Learning:** Polling intervals (like `setInterval` updating state) within components displaying large datasets will force full re-renders and recalculate all derived state variables repeatedly. In the `Overview` component, derived stats operations looping over the `students` array recalculate every 5 seconds because of an independent `activities` state update.
**Action:** Identify derived states that depend on large prop arrays, and use `React.useMemo` to cache them when state variables updated by polling routines do not affect the derived computations.
