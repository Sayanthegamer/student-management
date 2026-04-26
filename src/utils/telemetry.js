/**
 * Utility for sending telemetry data safely without exposing errors to the client console.
 */
export const sendErrorTelemetry = (context, error) => {
    // In a real app, this would send to Sentry, Datadog, etc.
    // We just safely stringify or serialize what we need for logging out of band.
    // For now, we mock the telemetry call.
    const _payload = {
        context,
        message: error?.message || String(error),
        timestamp: new Date().toISOString()
    };
    // Mock network request
    // fetch('/api/telemetry', { method: 'POST', body: JSON.stringify(_payload) }).catch(() => {});
};
