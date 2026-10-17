
/* ============================================================
   SANIA SAJU — PORTFOLIO
   GLOBAL SCRIPT

   RESPONSIBILITIES
   ------------------------------------------------------------
   - Lenis-powered internal navigation
   - Native scrolling fallback
   - Reduced-motion navigation
   - Hero email copy feedback
   - Stacked-section shadow overlays

   HERO ANIMATION:
   ------------------------------------------------------------
   Managed exclusively by hero.js.

   LENIS INITIALIZATION:
   ------------------------------------------------------------
   Managed by lenis.js.

============================================================ */


document.addEventListener("DOMContentLoaded", () => {


    /* ========================================================
       SETTINGS
    ======================================================== */

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


    /* ========================================================
       LENIS ACCESS
    ======================================================== */

    /*
       Retrieve the existing Lenis instance.

       Do not initialize a second instance here.
    */

    function getLenis() {

        return window.portfolioLenis || null;

    }


    /* ========================================================
       GLOBAL SCROLL UTILITY
    ======================================================== */

    /*
       Accepts:
       - A number: absolute document scroll position
       - An element: scroll to that element

       Lenis controls smooth scrolling when available.

       Native scrolling provides a fallback.
    */

    function scrollToTarget(target) {

        const immediate =
            prefersReducedMotion.matches;

        const lenis = getLenis();


        /* ----------------------------------------------------
           LENIS
        ---------------------------------------------------- */

        if (lenis) {

            lenis.scrollTo(target, {

                immediate: immediate,

                lerp: 0.1,

                offset: 0

            });

            return;

        }


        /* ----------------------------------------------------
           NATIVE FALLBACK
        ---------------------------------------------------- */

        const behavior =
            immediate ? "auto" : "smooth";


        if (typeof target === "number") {

            window.scrollTo({

                top: target,

                left: 0,

                behavior: behavior

            });

            return;

        }


        if (target instanceof Element) {

            target.scrollIntoView({

                behavior: behavior,

                block: "start"

            });

        }

    }


    /* ========================================================
       INTERNAL NAVIGATION
    ======================================================== */

    function initializeAnchorNavigation() {

        /*
           Event delegation supports links rendered by
           custom elements after DOMContentLoaded.
        */

        document.addEventListener(
            "click",
            event => {


                /* ------------------------------------------------
                   IGNORE MODIFIED / NON-PRIMARY CLICKS
                ------------------------------------------------ */

                if (
                    event.defaultPrevented ||
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                ) {
                    return;
                }


                /* ------------------------------------------------
                   FIND LINK
                ------------------------------------------------ */

                const link = event.target.closest?.(
                    'a[href^="#"]'
                );


                if (!link) {
                    return;
                }


                if (
                    link.hasAttribute("download") ||
                    (
                        link.target &&
                        link.target !== "_self"
                    )
                ) {
                    return;
                }


                const href =
                    link.getAttribute("href");


                if (!href || href === "#") {
                    return;
                }


                /* =================================================
                   HOME

                   Hero is sticky.

                   Always scroll to document position 0,
                   rather than targeting the Hero element.
                ================================================= */

                if (href === "#home") {

                    event.preventDefault();

                    scrollToTarget(0);

                    history.replaceState(
                        null,
                        "",
                        "#home"
                    );

                    return;

                }


                /* =================================================
                   OTHER ANCHORS

                   Includes:
                   #work
                   #pixels
                   #about
                   #contact

                   #pixels retains its specially positioned
                   anchor inside the Pages showcase.
                ================================================= */

                const target = document.getElementById(
                    href.slice(1)
                );


                if (!target) {
                    return;
                }


                event.preventDefault();


                scrollToTarget(target);


                history.replaceState(
                    null,
                    "",
                    href
                );

            }
        );

    }


    /* ========================================================
       HERO EMAIL COPY
    ======================================================== */

    function initializeEmailCopy() {

        const emailButton = document.querySelector(
            ".social-link--email"
        );


        if (!emailButton) {
            return;
        }


        let feedbackTimer = null;


        emailButton.addEventListener(
            "click",
            async event => {

                event.preventDefault();


                const email =
                    emailButton.dataset.email;


                if (!email) {
                    return;
                }


                try {

                    await navigator.clipboard.writeText(
                        email
                    );


                    window.clearTimeout(
                        feedbackTimer
                    );


                    emailButton.classList.add(
                        "is-copied"
                    );


                    emailButton.setAttribute(
                        "aria-label",
                        "Email address copied"
                    );


                    feedbackTimer = window.setTimeout(
                        () => {

                            emailButton.classList.remove(
                                "is-copied"
                            );


                            emailButton.setAttribute(
                                "aria-label",
                                "Copy email address"
                            );

                            feedbackTimer = null;

                        },
                        1000
                    );


                } catch (error) {

                    console.error(
                        "Could not copy email address.",
                        error
                    );

                }

            }
        );

    }


    /* ========================================================
       STACKED SECTION SHADOWS

       Shadow intensity responds to actual scroll progress.

       Lenis handles smooth scrolling.

       This function only updates visual overlays.

       MAX_SHADOW_OPACITY = 0.6
    ======================================================== */

    function initializeStackShadows() {

        const MAX_SHADOW_OPACITY = 0.6;


        /* ====================================================
           ELEMENTS
        ==================================================== */

        const heroSection = document.querySelector(
            ".hero"
        );

        const projectsSection = document.querySelector(
            "projects-section"
        );

        const pagesSection = document.querySelector(
            "pages-section"
        );

        const aboutSection = document.querySelector(
            "about-section"
        );

        const contactSection = document.querySelector(
            "contact-section"
        );

        const projectThree = document.querySelector(
            "projects-section .project:last-child"
        );


        /* ====================================================
           HELPERS
        ==================================================== */

        const clamp = (value, min, max) => {

            return Math.min(
                Math.max(value, min),
                max
            );

        };


        const setShadow = (section, progress) => {

            if (!section) {
                return;
            }


            const opacity =
                progress * MAX_SHADOW_OPACITY;


            section.style.setProperty(
                "--stack-shadow-opacity",
                opacity.toFixed(4)
            );

        };


        /* ====================================================
           INCOMING SECTION PROGRESS

           Section top = 100vh → progress 0
           Section top = 50vh  → progress 0.5
           Section top = 0     → progress 1
        ==================================================== */

        const getIncomingProgress = section => {

            if (!section) {
                return 0;
            }


            const rect =
                section.getBoundingClientRect();


            const viewportHeight =
                window.innerHeight || 1;


            return clamp(
                (viewportHeight - rect.top) /
                    viewportHeight,
                0,
                1
            );

        };


        /* ====================================================
           PROJECTS → PAGES

           Pages is underneath Project 03.

           Track the last project moving upward.
        ==================================================== */

        const getPagesRevealProgress = () => {

            if (!projectThree) {
                return 0;
            }


            const rect =
                projectThree.getBoundingClientRect();


            const viewportHeight =
                window.innerHeight || 1;


            return clamp(
                -rect.top / viewportHeight,
                0,
                1
            );

        };


        /* ====================================================
           UPDATE
        ==================================================== */

        const updateShadows = () => {


            /* HERO → PROJECTS */

            setShadow(
                heroSection,
                getIncomingProgress(
                    projectsSection
                )
            );


            /* PROJECTS → PAGES */

            setShadow(
                projectsSection,
                getPagesRevealProgress()
            );


            /* PAGES → ABOUT */

            setShadow(
                pagesSection,
                getIncomingProgress(
                    aboutSection
                )
            );


            /* ABOUT → CONTACT */

            setShadow(
                aboutSection,
                getIncomingProgress(
                    contactSection
                )
            );

        };


        /* ====================================================
           ANIMATION FRAME SCHEDULING
        ==================================================== */

        let ticking = false;


        const requestShadowUpdate = () => {

            if (ticking) {
                return;
            }


            ticking = true;


            window.requestAnimationFrame(() => {

                updateShadows();

                ticking = false;

            });

        };


        /* ====================================================
           NATIVE SCROLL EVENTS
        ==================================================== */

        window.addEventListener(
            "scroll",
            requestShadowUpdate,
            {
                passive: true
            }
        );


        /* ====================================================
           LENIS SCROLL EVENTS

           Subscribe to the existing Lenis instance.

           The animation-frame guard prevents redundant
           updates when native and Lenis events both fire.
        ==================================================== */

        const lenis = getLenis();


        if (lenis) {

            lenis.on(
                "scroll",
                requestShadowUpdate
            );

        }


        /* ====================================================
           RESIZE
        ==================================================== */

        window.addEventListener(
            "resize",
            requestShadowUpdate
        );


        /* ====================================================
           INITIAL STATE
        ==================================================== */

        updateShadows();

    }


    /* ========================================================
       INITIALIZE
    ======================================================== */

    initializeAnchorNavigation();

    initializeEmailCopy();

    initializeStackShadows();


});
