// Picks up a new deploy in a page left open, above all the installed Android
// app, which is resumed from the background rather than started, so the
// browser never reloads it on its own. There is no service worker: on every
// return to the foreground (and once an hour while open) this fetches the
// page's index.html and compares its scripts and stylesheets (content-hashed by
// the build) with the ones the running page was built from. A new version is
// applied by reloading, but only while no train remote is connected or
// connecting: a reload would drop the Bluetooth link mid-ride.

/** How often a page left open in the foreground looks for a new version. */
const CHECK_MS = 60 * 60 * 1000;
/** How often a found update looks for an idle moment to reload in. */
const IDLE_POLL_MS = 2000;
/** sessionStorage: the version this tab already reloaded into once. The
 *  origin is shared with other apps, hence the app's own prefix. */
const RELOADED_KEY = "trainsArduino.update.reloadedFor";

let idle = true;
let baseline: string | null = null;
let pending: string | null = null;
let checking = false;

/** Called by <App> whenever the Bluetooth status changes. */
export function setUpdateIdle(isIdle: boolean): void {
    idle = isIdle;
    tryApply();
}

function signature(doc: Document): string {
    return Array.from(doc.querySelectorAll('script, style, link[rel="stylesheet"]'))
        .map((el) => el.getAttribute("src") ?? el.getAttribute("href") ?? el.textContent ?? "")
        .join("\n");
}

function reloadedFor(): string | null {
    try {
        return sessionStorage.getItem(RELOADED_KEY);
    } catch {
        return null;
    }
}

function tryApply(): void {
    if (!pending || !idle) return;
    try {
        sessionStorage.setItem(RELOADED_KEY, pending);
    } catch {
        // storage blocked: the reload still happens
    }
    window.location.reload();
}

async function check(): Promise<void> {
    if (pending || checking || baseline === null) return;
    if (document.visibilityState !== "visible" || !navigator.onLine) return;
    checking = true;
    try {
        const res = await fetch(window.location.pathname, { cache: "no-store" });
        if (!res.ok) return;
        const latest = signature(new DOMParser().parseFromString(await res.text(), "text/html"));
        if (latest === baseline) return;
        // Already reloaded for exactly this version once: whatever still differs
        // is not an update this page can pick up, and reloading again would loop.
        if (latest === reloadedFor()) {
            baseline = latest;
            return;
        }
        pending = latest;
        tryApply();
        setInterval(tryApply, IDLE_POLL_MS);
    } catch {
        // offline or the server hiccupped: the next check tries again
    } finally {
        checking = false;
    }
}

/** Starts watching; call once, after the document has been parsed. */
export function watchForUpdates(): void {
    baseline = signature(document);
    document.addEventListener("visibilitychange", () => void check());
    setInterval(() => void check(), CHECK_MS);
}
