# 2024-04-29 - Extract Invariant Computations from Filter Loops
**Learning:** In components managing large arrays of data (e.g., up to 2000 students), performing redundant string operations like `.toLowerCase()` inside a `.filter()` loop creates an O(N) overhead. React's `useMemo` hooks update frequently on filter state changes, amplifying this overhead.
**Action:** Always hoist invariant string operations (like `toLowerCase()`) or data parsing before using filter, map, or sort to pre-calculate the value once per render cycle.

## 2024-05-15 - Memoize Expensive Operations in Polling Components

**Learning:** Polling intervals (like `setInterval` updating state) within components displaying large datasets will force full re-renders and recalculate all derived state variables repeatedly. In the `Overview` component, derived stats operations looping over the `students` array recalculate every 5 seconds because of an independent `activities` state update.
**Action:** Identify derived states that depend on large prop arrays, and use `React.useMemo` to cache them when state variables updated by polling routines do not affect the derived computations.

## 2024-05-18 - Hoist Invariant Date Instantiation

**Learning:** Instantiating `new Date().toISOString().slice(0, 7)` inside loops (like `Array.prototype.filter` or `Array.prototype.map`) that process large datasets (e.g. 2000 items) is extremely slow due to repeated parsing and string processing (creating significant overhead, e.g., 425ms vs 5ms execution times in benchmarks).
**Action:** When filtering or mapping data where an unchanging derived property like the current date/time is needed, calculate that value once before the loop (using `useMemo` in React components, or as a simple hoisted variable) and pass it into the loop/callback explicitly.

## $(date +%Y-%m-%d) - Array Reductions & Sorting in Modals
**Learning:** React components containing frequently toggled internal states (e.g., `isClosing` timeouts for animations) can trigger expensive recalculations if data transformations like O(N log N) sorting and O(N) inline `.reduce()` operations aren't memoized.
**Action:** When mapping over data arrays inside modal or dialog components, hoist and wrap derived lists and cumulative totals in `useMemo` hooks, keeping the dependency array scoped strictly to the incoming prop (e.g., `history`). Use variables to replace redundant inline calculations to prevent unexpected runtime reference errors.
