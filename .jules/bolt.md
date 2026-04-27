## 2024-04-27 - [Date Parsing Optimization]

**Learning:** `new Date(string)` is slow, especially when sorting large arrays (like fee histories across multiple students). Since the dates are in ISO 8601 format (`YYYY-MM-DD`), string comparison (`a.date > b.date` or `a.date.localeCompare(b.date)`) is significantly faster than parsing them into Date objects and subtracting.
**Action:** Replace `new Date(a.date) - new Date(b.date)` with string comparisons where possible, especially in sort functions, to improve rendering performance of lists like the Payment History. Also parsing ISO date strings with `new Date("YYYY-MM-DD")` creates a UTC date, which might shift by a day due to local timezone offsets. Construct explicit local Dates instead (`new Date(year, month - 1, day)`).
