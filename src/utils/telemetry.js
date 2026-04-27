/**
 * Utility for sending telemetry data safely without exposing errors to the client console.
 */
export const sendErrorTelemetry = (context, error) => {
    // In a real app, this would send to Sentry, Datadog, etc.
    // We just safely stringify or serialize what we need for logging out of band.
    const _payload = {
        context,
        message: error?.message || String(error),
        timestamp: new Date().toISOString()
    };

    // Send telemetry in a fire-and-forget, safe way
    try {
        const endpoint = '/api/telemetry';
        const serializedPayload = JSON.stringify(_payload);

        // Prefer sendBeacon when available (more reliable for page unload scenarios)
        if (navigator.sendBeacon) {
            const blob = new Blob([serializedPayload], { type: 'application/json' });
            navigator.sendBeacon(endpoint, blob);
        } else {
            // Fallback to fetch with keepalive
            fetch(endpoint, {
                method: 'POST',
                body: serializedPayload,
                headers: { 'Content-Type': 'application/json' },
                keepalive: true
            }).catch(() => {}); // Swallow errors - telemetry must never break app
        }
    } catch (e) {
        // Swallow any telemetry errors to ensure app behavior is never affected
    }
};
