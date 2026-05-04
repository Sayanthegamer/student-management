/**
 * Utility for sending telemetry data safely without exposing errors to the client console.
 */
export const sendErrorTelemetry = (context, error) => {
    // Build a structured, redacted payload for observability.
    // In production, this can be picked up by Vercel Log Drain, Sentry, Datadog, etc.
    const _payload = {
        context,
        message: 'client_error_redacted',
        errorType: error?.name || typeof error,
        errorCode: error?.code || null,
        hasStack: Boolean(error?.stack),
        timestamp: new Date().toISOString()
    };

    // Log structured telemetry via console.debug (captured by log drains, hidden from users).
    // NOTE: No network request is made — /api/telemetry does not exist.
    // When a real telemetry service is integrated, replace this with a sendBeacon/fetch call.
    try {
        if (import.meta.env.DEV) {
            console.debug('[telemetry]', _payload);
        }
        // Production: silently discard until a real endpoint is configured.
        // To enable, uncomment and set a real endpoint:
        // const endpoint = 'https://your-telemetry-service.com/ingest';
        // navigator.sendBeacon?.(endpoint, new Blob([JSON.stringify(_payload)], { type: 'application/json' }));
    } catch {
        // Swallow any telemetry errors to ensure app behavior is never affected
    }
};
