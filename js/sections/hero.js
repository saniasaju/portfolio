
/* ============================================================
   SANIA SAJU — PORTFOLIO
   HERO MOTION

   RESPONSIBILITIES
   ------------------------------------------------------------
   - Wait for the loading screen
   - Reveal the central D
   - Expand Designer / Developer + metadata
   - Reveal navbar and Hero footer together
   - Announce completion of the Hero intro
   - Move navbar upward as Projects enters
   - Respect reduced-motion preferences

   LENIS COMPATIBILITY
   ------------------------------------------------------------
   - Uses actual viewport coordinates
   - Supports native and Lenis scroll events
   - Does not create another Lenis instance
   - Does not interfere with CSS entrance transitions

============================================================ */


document.addEventListener("DOMContentLoaded", () => {


    /* ========================================================
       ELEMENTS
    ======================================================== */

    const hero = document.querySelector(
        ".hero"
    );


    if (!hero) {
        return;
    }


    const mobileHero = window.matchMedia("(orientation: portrait), (min-width: 768px) and (max-width: 1280px)");
    const core = () => hero.querySelector(
        mobileHero.matches ? ".hero-mobile__core" : ".hero__title-core"
    );


    const finalTitleElement = () => hero.querySelector(
        mobileHero.matches ? ".hero-mobile__purpose" : ".hero__title-metadata-right"
    );


    const navbar = hero.querySelector(
        "portfolio-navbar"
    );


    const projectsSection = document.querySelector(
        "projects-section"
    );


    /* ========================================================
       SETTINGS
    ======================================================== */

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


    /* ========================================================
       STATE
    ======================================================== */

    let hasStarted = false;

    let hasCompleted = false;

    let sequenceCancelled = false;

    let navbarRafId = null;


    /* ========================================================
       TRANSITION HELPER
    ======================================================== */

    /*
       Wait for a specific CSS transition to finish.

       A fallback timeout ensures the sequence continues
       if transitionend does not fire.
    */

    function waitForTransition(
        element,
        property,
        fallbackDuration
    ) {

        return new Promise(resolve => {

            if (!element) {

                resolve();

                return;

            }


            let finished = false;


            const complete = () => {

                if (finished) {
                    return;
                }


                finished = true;


                element.removeEventListener(
                    "transitionend",
                    handleTransitionEnd
                );


                resolve();

            };


            const handleTransitionEnd = event => {

                if (
                    event.target !== element ||
                    event.propertyName !== property
                ) {
                    return;
                }


                complete();

            };


            element.addEventListener(
                "transitionend",
                handleTransitionEnd
            );


            window.setTimeout(
                complete,
                fallbackDuration
            );

        });

    }


    /* ========================================================
       ANNOUNCE HERO COMPLETION
    ======================================================== */

    /*
       Keep this event available for other components
       that may need to react to Hero completion.

       Dispatch it only once.
    */

    function announceHeroComplete() {

        if (hasCompleted) {
            return;
        }


        hasCompleted = true;


        window.dispatchEvent(
            new CustomEvent(
                "portfolio:hero-motion-complete"
            )
        );

    }


    /* ========================================================
       REVEAL WITHOUT MOTION
    ======================================================== */

    function revealWithoutMotion() {

        sequenceCancelled = true;


        hero.classList.add(
            "is-core-visible",
            "is-title-visible",
            "is-chrome-visible"
        );


        announceHeroComplete();

    }


    /* ========================================================
       HERO INTRO SEQUENCE
    ======================================================== */

    async function runHeroSequence() {


        /* ====================================================
           STAGE 01
           CENTRAL D
        ==================================================== */

        hero.classList.add(
            "is-core-visible"
        );


        await waitForTransition(
            core(),
            "opacity",
            850
        );


        if (sequenceCancelled) {
            return;
        }


        /* ====================================================
           STAGE 02
           DESIGNER / DEVELOPER + METADATA
        ==================================================== */

        hero.classList.add(
            "is-title-visible"
        );


        await waitForTransition(
            finalTitleElement(),
            mobileHero.matches ? "translate" : "transform",
            1350
        );


        if (sequenceCancelled) {
            return;
        }


        /* ====================================================
           STAGE 03
           NAVBAR + FOOTER

           Both are controlled by the same Hero state.

           Navbar slides down from the top.
           Footer slides up from the bottom.
        ==================================================== */

        hero.classList.add(
            "is-chrome-visible"
        );


        announceHeroComplete();

    }


    /* ========================================================
       START HERO
    ======================================================== */

    function startHero() {

        if (hasStarted) {
            return;
        }


        hasStarted = true;


        /* ----------------------------------------------------
           REDUCED MOTION
        ---------------------------------------------------- */

        if (
            prefersReducedMotion.matches ||
            document.documentElement.classList.contains("home-is-revealed")
        ) {

            revealWithoutMotion();

            return;

        }


        /* ----------------------------------------------------
           DOUBLE RAF

           Allow the browser to paint the initial hidden
           state before beginning the motion sequence.
        ---------------------------------------------------- */

        window.requestAnimationFrame(() => {

            window.requestAnimationFrame(() => {

                if (sequenceCancelled) {
                    return;
                }


                runHeroSequence();

            });

        });

    }


    /* ========================================================
       WAIT FOR LOADING SCREEN
    ======================================================== */

    function initializeHeroIntro() {

        /*
           loading.js removes body.is-loading when
           the home page assets have finished loading.

           If loading has already completed,
           start immediately.
        */

        if (
            !document.body.classList.contains(
                "is-loading"
            )
        ) {

            startHero();

            return;

        }


        const loadingObserver = new MutationObserver(
            () => {

                if (
                    document.body.classList.contains(
                        "is-loading"
                    )
                ) {
                    return;
                }


                loadingObserver.disconnect();

                startHero();

            }
        );


        loadingObserver.observe(
            document.body,
            {
                attributes: true,
                attributeFilter: ["class"]
            }
        );

    }


    /* ========================================================
       REDUCED MOTION CHANGES
    ======================================================== */

    function handleMotionPreferenceChange(event) {

        if (
            event.matches &&
            !hasCompleted
        ) {

            revealWithoutMotion();

        }

    }


    prefersReducedMotion.addEventListener?.(
        "change",
        handleMotionPreferenceChange
    );


    /* ========================================================
       INITIALIZE
    ======================================================== */

    initializeHeroIntro();



});
