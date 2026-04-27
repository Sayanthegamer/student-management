
# Sentinel Security Journal

## 2024-05-20 - [Information Exposure in Authentication Flow & Weak Password Length]
**Vulnerability:** The application previously exposed raw error messages (like database structure details or explicit connection errors) during user login and password reset directly to the UI using `err.message`. It also had weak password validation constraints with `minLength={6}`.
**Learning:** These practices can be exploited by an attacker using credential stuffing or brute-forcing since it would inform them of exactly what went wrong or how they can deduce backend structure. Short passwords reduce the entropy needed to bypass authentication, significantly aiding an attacker's dictionary or brute-force attack.
**Prevention:** Always provide generic, safe messages (e.g. "Invalid email or password", "Registration failed. Please try again.") through sanitized client logs + secure server-side telemetry. Detailed exception logging must be handled in the server-side telemetry/backend logging layer (not client console). Ensure a secure minimal length for passwords such as 8 or 12.
