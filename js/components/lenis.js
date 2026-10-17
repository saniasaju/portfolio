
/* ============================================================
   SANIA SAJU — PORTFOLIO
   LENIS SMOOTH SCROLL
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    if (typeof Lenis === "undefined") {
        console.warn("Lenis could not be loaded.");
        return;
    }

    const lenis = new Lenis({

        // Automatically manage animation frames
        autoRaf: true,

        // Smooth mouse-wheel scrolling
        smoothWheel: true,

        // Subtle, responsive smoothing
        lerp: 0.1,

        // Keep wheel sensitivity natural
        wheelMultiplier: 1,

        // Respect accessibility preferences
        respectReducedMotion: true,

        // Existing anchor navigation is handled separately
        anchors: false,

        // Prevent smoothing inside form scroll areas
        prevent: (node) =>
            node.classList?.contains(
                "contact-form__message"
            )

    });

    // Make Lenis available to other portfolio scripts
    window.portfolioLenis = lenis;

});
