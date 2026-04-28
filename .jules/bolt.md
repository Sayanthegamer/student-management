## 2024-04-27 - [Date Parsing Optimization]

**Learning:** `new Date(string)` is slow, especially when sorting large arrays (like fee histories across multiple students). Since the dates are in ISO 8601 format (`YYYY-MM-DD`), string comparison (`a.date > b.date` or `a.date.localeCompare(b.date)`) is significantly faster than parsing them into Date objects and subtracting.
**Action:** Replace `new Date(a.date) - new Date(b.date)` with string comparisons where possible, especially in sort functions, to improve rendering performance of lists like the Payment History. Also parsing ISO date strings with `new Date("YYYY-MM-DD")` creates a UTC date, which might shift by a day due to local timezone offsets. Construct explicit local Dates instead (`new Date(year, month - 1, day)`).

## 2024-05-18 - [Date Object Creation in Loops]

**Learning:** Instantiating `new Date()` inside a large array mapping or `.filter()` loop is computationally expensive. For operations like calculating a constant retention date, it degrades performance.
**Action:** When filtering or comparing dates against a dynamic limit (e.g., "3 months ago"), always instantiate the limit date `new Date()` *outside* of the loop and pass the reference in, ensuring it only computes once per render.

## 2024-05-18 - [Date Parsing and Validation]
**Learning:** Parsing `YYYY-MM-DD` strings directly with `new Date(string)` treats them as UTC, leading to timezone shifts when interacting with local dates. Additionally, JS `Date` silently rolls over invalid dates (like `2024-02-30` to `2024-03-01`), bypassing simple validation.
**Action:** Always strictly validate `YYYY-MM-DD` string format using a regex (`/^\d{4}-\d{2}-\d{2}$/`). Parse the components and construct local dates explicitly via `new Date(year, month - 1, day)`. To ensure the date is valid, check that the resulting `.getFullYear()`, `.getMonth() + 1`, and `.getDate()` strictly match the parsed parts. Invalid dates should be handled defensively (e.g., filtered out).
