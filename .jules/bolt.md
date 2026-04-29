# 2024-04-29 - Extract Invariant Computations from Filter Loops
**Learning:** In components managing large arrays of data (e.g., up to 2000 students), performing redundant string operations like `.toLowerCase()` inside a `.filter()` loop creates an O(N) overhead. React's `useMemo` hooks update frequently on filter state changes, amplifying this overhead.
**Action:** Always hoist invariant string operations (like `toLowerCase()`) or data parsing before using filter, map, or sort to pre-calculate the value once per render cycle.
