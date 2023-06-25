export function json(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "content-type": "application/json" },
    });
}

/**
 * Measure time duration
 *
 * @returns call stop() to return milliseconds between init and stop
 */
export function createTimer() {
    const start = Date.now();
    let elapsedMs;
    return {
        stop: () => (elapsedMs = Date.now() - start),   // a little like "lap"
        duration: () => elapsedMs,                      // a little like "last lap"
    };
}

export interface Timer {
    stop: () => number,
    duration: () => number
}