(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (navigation?.type !== "reload") return;

    // Run in the head, before sections or anchor navigation initialize.
    const entry = new URL("../../index.html", document.currentScript.src);
    const root = new URL("../../", document.currentScript.src);
    const currentPath = window.location.pathname;

    // Case studies reload in place, preserving their URL and section hash.
    if (currentPath.startsWith(new URL("pages/", root).pathname)) return;

    // Refreshing the revealed return homepage is a fresh entry.
    if (![entry.pathname, root.pathname].includes(currentPath)) {
        window.location.replace(entry.href);
        return;
    }

    // A refreshed homepage starts at the hero instead of restoring its scroll
    // position or following a section hash left by the previous visit.
    history.scrollRestoration = "manual";
    const url = new URL(window.location.href);
    url.hash = "";
    history.replaceState(history.state, "", url.href);

    const resetScroll = () => {
        window.portfolioLenis?.scrollTo(0, { immediate: true, force: true });
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    resetScroll();
    document.addEventListener("DOMContentLoaded", resetScroll, { once: true });
    window.addEventListener("load", resetScroll, { once: true });
    window.addEventListener("pageshow", resetScroll, { once: true });
})();
