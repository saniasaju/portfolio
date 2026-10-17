
/* ============================================================
   SANIA SAJU — PORTFOLIO CASE STUDY

   LENIS OUTER + INNER SCROLL + HERO RETURN

   RESPONSIBILITIES
   ------------------------------------------------------------
   - Initialize Lenis for the outer document
   - Smoothly move from Hero to Case Study
   - Settle Case Study beneath the sticky navbar
   - Enable right-column scrolling after settling
   - Apply Lenis-style easing to the right column
   - Route sidebar scrolling into the right column
   - Highlight the active Contents item
   - Navigate between Contents sections
   - Return smoothly to Hero from Overview
   - Handle direct URL hash navigation
   - Respect reduced-motion preferences

   SCROLL STRUCTURE
   ------------------------------------------------------------
   OUTER DOCUMENT:
       Lenis

   INNER CASE STUDY:
       Lenis with a dedicated content wrapper

   HERO RETURN:
       Lenis scrollTo(0)

============================================================ */


document.addEventListener("DOMContentLoaded", () => {

    const overlappingHero = document.querySelector(".portfolio-hero, .campinn-hero, .gym-hero");
    const incomingStudy = document.querySelector(".portfolio-study, .campinn-study, .gym-study");
    if (overlappingHero && incomingStudy) {
        let shadowFrame = 0;
        const updateOverlapShadow = () => {
            shadowFrame = 0;
            const progress = Math.max(0, Math.min(1,
                (window.innerHeight - incomingStudy.getBoundingClientRect().top) / window.innerHeight
            ));
            overlappingHero.style.setProperty("--stack-shadow-opacity",
                window.matchMedia("(orientation: portrait), (min-width: 768px) and (max-width: 1280px)").matches ? (progress * 0.6).toFixed(4) : "0"
            );
        };
        const scheduleOverlapShadow = () => {
            if (!shadowFrame) shadowFrame = requestAnimationFrame(updateOverlapShadow);
        };
        window.addEventListener("scroll", scheduleOverlapShadow, { passive: true });
        window.addEventListener("resize", scheduleOverlapShadow);
        updateOverlapShadow();
    }



    /* ========================================================
       ELEMENTS
    ======================================================== */

    // All three case studies share the controller and timing settings.
    const caseStudyName = document.body.classList.contains("campinn-page")
        ? "campinn"
        : document.body.classList.contains("gym-page") ? "gym" : "portfolio";

    // All case studies use document scrolling on smaller screens.
    const usesInternalScroller = () =>
        window.matchMedia("(orientation: landscape) and (max-width: 767px), (orientation: landscape) and (min-width: 1281px)").matches;

    const navbar = document.querySelector(
        `.${caseStudyName}-page__navbar`
    );

    const study = document.querySelector(
        `.${caseStudyName}-study`
    );

    const workspace = document.querySelector(
        `.${caseStudyName}-study__workspace`
    );

    const content = document.querySelector(
        `.${caseStudyName}-study__content`
    );

    const tocLinks = Array.from(
        document.querySelectorAll(
            `.${caseStudyName}-study__toc-link`
        )
    );

    const sections = Array.from(
        document.querySelectorAll(
            "[data-study-section]"
        )
    );


    if (!study || !workspace || !content) {
        return;
    }


    /* ========================================================
       SETTINGS
    ======================================================== */

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const OUTER_LERP = 0.1;

    const INNER_LERP = OUTER_LERP;

    const SETTLE_TOLERANCE = 1.5;

    const ACTIVE_SECTION_OFFSET = 96;


    /* ========================================================
       STATE
    ======================================================== */

    let isSettled = false;

    let isReturningToHero = false;

    let handoffInProgress = false;

    let lastWheelTime = -Infinity;

    let wheelGestureStartedInHero = false;

    let wheelGestureStartedAtContentTop = false;

    let lastWheelDelta = 0;

    let pageRafId = null;

    let contentRafId = null;

    let innerTarget = content.scrollTop;

    let heroReturnRafId = null;


    /* ========================================================
       PREPARE INNER SCROLLER

       The right column is only protected from Lenis
       while the Case Study is settled.

       Remove any permanent prevention attribute.
    ======================================================== */

    content.removeAttribute(
        "data-lenis-prevent"
    );

    content.style.scrollBehavior = "auto";


    /* ========================================================
       LENIS — OUTER DOCUMENT

       One Lenis instance controls the page.

       While the Case Study is settled, wheel movement
       inside the workspace is handled separately.

       During the return to Hero, Lenis is allowed
       to animate the document again.
    ======================================================== */

    const lenis = typeof Lenis !== "undefined"

        ? new Lenis({

            autoRaf: true,

            smoothWheel: true,

            respectReducedMotion: true,

            lerp: OUTER_LERP,

            wheelMultiplier: 1,

            anchors: false,

            // Preserve zoom and horizontal gestures without transferring
            // the Hero gesture's excess distance into the content column.
            virtualScroll: ({ event }) => {
                return !event.ctrlKey &&
                    Math.abs(event.deltaX) <= Math.abs(event.deltaY);
            },

            prevent: node => {

    /*
       During the return to Hero, Lenis must be
       allowed to process wheel input everywhere.
    */

    if (isReturningToHero) {
        return false;
    }

    /*
       Before the Case Study settles, Lenis controls
       the entire outer document.
    */

    if (!isSettled) {
        return false;
    }

    /*
       Once settled, wheel events inside the workspace
       are handled by the right-column easing system.
    */

    return Boolean(
        node.closest?.(
            `.${caseStudyName}-study__workspace`
        )
    );

}

        })

        : null;


    // A separate content element lets Lenis observe changes in column height.
    const scrollBody = document.createElement("div");
    scrollBody.className = `${caseStudyName}-study__scroll-body`;
    scrollBody.append(...content.childNodes);
    content.append(scrollBody);

    const innerLenis = typeof Lenis !== "undefined"
        ? new Lenis({
            wrapper: content,
            content: scrollBody,
            autoRaf: true,
            lerp: INNER_LERP,
            respectReducedMotion: true,
            anchors: false,
            // The workspace handler routes wheel input from either column.
            // Touch, keyboard and scrollbar input retain native behavior.
            virtualScroll: () => false
        })
        : null;

    window[`${caseStudyName}StudyLenis`] = innerLenis;

    window[`${caseStudyName}Lenis`] = lenis;


    if (!lenis) {

        console.warn(
            "Lenis unavailable. Using native page scrolling."
        );

    }


    /* ========================================================
       NAVBAR HEIGHT
    ======================================================== */

    const getNavbarHeight = () => {

        return navbar
            ? navbar.getBoundingClientRect().height
            : 0;

    };


    /* ========================================================
       OUTER SCROLL POSITION
    ======================================================== */

    const getOuterScrollPosition = () => {

        return lenis
            ? lenis.scroll
            : window.scrollY;

    };


    /* ========================================================
       SETTLED SCROLL POSITION

       The final position is directly beneath the
       sticky navbar.

       The Case Study does not move behind the navbar.
    ======================================================== */

    const getSettledScrollPosition = () => {

        const documentTop =
            window.scrollY +
            study.getBoundingClientRect().top;


        const target = Math.max(
            documentTop - getNavbarHeight(),
            0
        );


        const limit = lenis
            ? lenis.limit
            : Math.max(
                document.documentElement.scrollHeight -
                document.documentElement.clientHeight,
                0
            );


        return Math.min(
            target,
            limit
        );

    };


    /* ========================================================
       INNER SCROLL LIMIT
    ======================================================== */

    const getInnerLimit = () => {

        return Math.max(
            content.scrollHeight -
            content.clientHeight,
            0
        );

    };


    /* ========================================================
       CLAMP INNER SCROLL
    ======================================================== */

    const clampInnerScroll = value => {

        return Math.min(
            Math.max(value, 0),
            getInnerLimit()
        );

    };


    /* ========================================================
       INNER SCROLL BOUNDARIES

       Check both the actual position and pending target.

       This ensures Hero return does not begin while
       inner easing is still moving toward Overview.
    ======================================================== */

    const isContentAtTop = () => {

        return (
            content.scrollTop <= 1 &&
            innerTarget <= 1
        );

    };


    const isContentAtBottom = () => {

        const limit = getInnerLimit();

        return (
            content.scrollTop >= limit - 1 &&
            innerTarget >= limit - 1
        );

    };


    /* ========================================================
       STOP INNER EASING
    ======================================================== */

    const stopInnerEasing = () => {
        innerLenis?.scrollTo(content.scrollTop, { immediate: true });
        innerTarget = content.scrollTop;
    };


    /* ========================================================
       ACTIVE CONTENTS ITEM
    ======================================================== */

    const setActiveSection = id => {

        tocLinks.forEach(link => {

            const active =
                link.getAttribute("href") ===
                `#${id}`;


            link.classList.toggle(
                "is-active",
                active
            );


            if (active) {

                link.setAttribute(
                    "aria-current",
                    "true"
                );

            } else {

                link.removeAttribute(
                    "aria-current"
                );

            }

        });

    };


    /* ========================================================
       DETECT ACTIVE CONTENT SECTION
    ======================================================== */

    const updateActiveSection = () => {

        contentRafId = null;


        if (!sections.length) {
            return;
        }


        const contentRect =
            content.getBoundingClientRect();


        const markerY =
            contentRect.top +
            ACTIVE_SECTION_OFFSET;


        let activeSection =
            sections[0];


        sections.forEach(section => {

            const rect =
                section.getBoundingClientRect();


            if (rect.top <= markerY) {

                activeSection =
                    section;

            }

        });


        setActiveSection(
            activeSection.id
        );

    };


    /* ========================================================
       REQUEST ACTIVE UPDATE
    ======================================================== */

    const requestActiveUpdate = () => {

        if (contentRafId !== null) {
            return;
        }


        contentRafId =
            requestAnimationFrame(
                updateActiveSection
            );

    };


    /* ========================================================
       INNER LENIS NAVIGATION

       Wheel input and Contents links share the same Lenis instance.
       Without the library, keep the column usable with native scrolling.
    ======================================================== */

    const scrollInnerTo = (position, immediate = false) => {
        innerTarget = clampInnerScroll(position);

        if (innerLenis) {
            innerLenis.scrollTo(innerTarget, {
                immediate: immediate || prefersReducedMotion.matches,
                onComplete: () => {
                    innerTarget = content.scrollTop;
                    requestActiveUpdate();
                }
            });
        } else {
            content.scrollTop = innerTarget;
        }

        requestActiveUpdate();
    };

    const scrollInnerBy = delta => {
        // Reaching Overview finishes this gesture inside the column.
        // A separate upward gesture from the top returns to Hero.
        scrollInnerTo(innerTarget + delta);
    };


    /* ========================================================
       INNER CONTENT SCROLL EVENT

       Keeps Contents highlighting synchronized.

       Also supports native keyboard and scrollbar input.
    ======================================================== */

    content.addEventListener(
        "scroll",
        () => {

            requestActiveUpdate();


            if (
                !innerLenis?.isScrolling
            ) {

                innerTarget =
                    content.scrollTop;

            }

        },
        {
            passive: true
        }
    );


    /* ========================================================
       SET SETTLED STATE

       The CSS class activates or disables overflow
       on the right-hand content column.
    ======================================================== */

    const setSettled = value => {

        if (isSettled === value) {
            return;
        }


        isSettled = value;


        study.classList.toggle(
            "is-settled",
            value
        );


        if (!value) {

            stopInnerEasing();

        } else {

            innerTarget =
                content.scrollTop;

        }

    };


    /* ========================================================
       CASE STUDY STATE
    ======================================================== */

    
const updateStudyState = () => {

    pageRafId = null;

    if (!usesInternalScroller()) {
        setSettled(false);
        return;
    }

    /* ========================================================
       RECOVER HERO-RETURN STATE
    ======================================================== */

    if (isReturningToHero) {

        const heroReached =
            getOuterScrollPosition() <= 2;

        const outerScrollStopped =
            lenis
                ? !lenis.isScrolling
                : true;

        if (heroReached || outerScrollStopped) {

            isReturningToHero = false;

        } else {

            return;

        }

    }


    /* ========================================================
       PREVENT RE-ENTRANT HANDOFF
    ======================================================== */

    if (handoffInProgress) {
        return;
    }


    /* ========================================================
       EXISTING SETTLED-POSITION CALCULATIONS CONTINUE HERE
    ======================================================== */

    const rect =
        study.getBoundingClientRect();

    const navbarHeight =
        getNavbarHeight();

    const targetScroll =
        getSettledScrollPosition();

    const currentScroll =
        getOuterScrollPosition();

    const visuallySettled =
        rect.top <=
        navbarHeight + SETTLE_TOLERANCE;

    const reachedTarget =
        currentScroll >=
        targetScroll - SETTLE_TOLERANCE;

    const shouldSettle =
        visuallySettled &&
        reachedTarget;


    if (shouldSettle && !isSettled) {

        handoffInProgress = true;

        if (lenis) {

            lenis.scrollTo(
                targetScroll,
                {
                    immediate: true
                }
            );

        } else {

            window.scrollTo({
                top: targetScroll,
                behavior: "auto"
            });

        }

        setSettled(true);

        handoffInProgress = false;

        return;

    }


    if (!shouldSettle && isSettled) {

        setSettled(false);

    }

};


    /* ========================================================
       REQUEST STUDY UPDATE
    ======================================================== */

    const requestStudyUpdate = () => {

        if (pageRafId !== null) {
            return;
        }


        pageRafId =
            requestAnimationFrame(
                updateStudyState
            );

    };


    /* ========================================================
       INNER TARGET POSITION
    ======================================================== */

    const getInnerTargetPosition = target => {

        const contentRect =
            content.getBoundingClientRect();


        const targetRect =
            target.getBoundingClientRect();


        return (
            content.scrollTop +
            targetRect.top -
            contentRect.top
        );

    };


    /* ========================================================
       ALIGN CASE STUDY

       Used for Contents navigation and initial hashes.
    ======================================================== */

    const alignStudy = () => {

        /*
           If a Hero-return animation is active,
           cancel its ownership before aligning
           the document with the Case Study.
        */

        isReturningToHero = false;


        const target =
            getSettledScrollPosition();


        if (lenis) {

            lenis.scrollTo(
                target,
                {
                    immediate: true
                }
            );

        } else {

            window.scrollTo({

                top: target,

                behavior: "auto"

            });

        }


        setSettled(true);

    };


    /* ========================================================
       CONTENTS NAVIGATION

       Contents links scroll the inner column using
       the same easing as the mouse wheel.
    ======================================================== */

    tocLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {


                const href =
                    link.getAttribute("href");


                if (
                    !href ||
                    !href.startsWith("#")
                ) {
                    return;
                }


                const target =
                    document.getElementById(
                        href.slice(1)
                    );


                if (
                    !target ||
                    !target.matches(
                        "[data-study-section]"
                    )
                ) {
                    return;
                }


                event.preventDefault();


                /* ----------------------------------------
                   ALIGN OUTER PAGE
                ---------------------------------------- */

                if (!usesInternalScroller()) {
                    target.scrollIntoView({
                        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
                        block: "start"
                    });
                    setActiveSection(target.id);
                    history.replaceState(null, "", href);
                    return;
                }

                if (
                    !isSettled ||
                    isReturningToHero
                ) {

                    alignStudy();

                }


                /* ----------------------------------------
                   EASE RIGHT COLUMN
                ---------------------------------------- */

                scrollInnerTo(
                    getInnerTargetPosition(target)
                );


                /* ----------------------------------------
                   ACTIVE CONTENTS
                ---------------------------------------- */

                setActiveSection(
                    target.id
                );


                /* ----------------------------------------
                   UPDATE URL
                ---------------------------------------- */

                history.replaceState(
                    null,
                    "",
                    href
                );

            }
        );

    });


    /* ========================================================
       NORMALIZE WHEEL DELTA
    ======================================================== */

    const getWheelDelta = event => {

        const multiplier =
            event.deltaMode === 1

                ? 16

                : event.deltaMode === 2

                    ? content.clientHeight

                    : 1;


        return (
            event.deltaY * multiplier
        );

    };


    /* ========================================================
       COMPLETE HERO RETURN

       Restore normal scroll-state detection only after
       the Hero has returned to the viewport.
    ======================================================== */

    const completeHeroReturn = () => {

        if (!isReturningToHero) {
            return;
        }


        isReturningToHero = false;


        if (heroReturnRafId !== null) {

            cancelAnimationFrame(
                heroReturnRafId
            );

            heroReturnRafId = null;

        }


        requestStudyUpdate();

    };


    /* ========================================================
       RETURN TO HERO

       Trigger:
       Scroll upward when the right column is at Overview.

       Sequence:
       01. Stop inner easing
       02. Lock Case Study state updates
       03. Disable inner scrolling
       04. Use Lenis to scroll to the Hero
       05. Unlock when the transition completes

       The Case Study moves downward naturally as the
       outer document scrolls toward position 0.
    ======================================================== */

    const releaseToOuterPage = () => {


        /* ----------------------------------------------------
           PREVENT DUPLICATE TRANSITIONS
        ---------------------------------------------------- */

        if (isReturningToHero) {
            return;
        }


        /* ----------------------------------------------------
           LOCK HERO RETURN
        ---------------------------------------------------- */

        isReturningToHero = true;


        /* ----------------------------------------------------
           STOP INNER EASING
        ---------------------------------------------------- */

        stopInnerEasing();


        /* ----------------------------------------------------
           DISABLE RIGHT-COLUMN SCROLLING
        ---------------------------------------------------- */

        setSettled(false);

        // Finish the column's remaining movement alongside the Hero return.
        scrollInnerTo(0);


        /* ----------------------------------------------------
           LENIS RETURN TO HERO
        ---------------------------------------------------- */

        if (lenis) {

            lenis.scrollTo(
                0,
                {

                    // A finite transition avoids a long easing tail at Hero.
                    lerp: 0,
                    duration: 0.7,
                    easing: t => 1 - Math.pow(1 - t, 3),

                    immediate:
                        prefersReducedMotion.matches,

                    onComplete: () => {

                        completeHeroReturn();

                    }

                }
            );


            /*
               When reduced motion is enabled,
               finish the state transition immediately.
            */

            if (prefersReducedMotion.matches) {

                completeHeroReturn();

            }

        }


        /* ----------------------------------------------------
           NATIVE SCROLL FALLBACK
        ---------------------------------------------------- */

        else {

            window.scrollTo({

                top: 0,

                behavior:
                    prefersReducedMotion.matches
                        ? "instant"
                        : "smooth"

            });


            const checkHeroReturn = () => {

                heroReturnRafId = null;


                if (!isReturningToHero) {
                    return;
                }


                if (window.scrollY <= 2) {

                    completeHeroReturn();

                    return;

                }


                heroReturnRafId =
                    requestAnimationFrame(
                        checkHeroReturn
                    );

            };


            if (prefersReducedMotion.matches) {

                completeHeroReturn();

            } else {

                heroReturnRafId =
                    requestAnimationFrame(
                        checkHeroReturn
                    );

            }

        }

    };


    /* ========================================================
       WHEEL HANDOFF

       BEFORE SETTLING:
           Lenis moves the outer page.

       AFTER SETTLING:
           The right column eases independently.

       UPWARD AT OVERVIEW:
           The Hero returns into view.

       DURING HERO RETURN:
           Additional wheel input can interrupt the transition naturally.
    ======================================================== */

    // A trackpad swipe includes momentum events after the page settles.
    // Keep that entire gesture on the outer page. A new gesture after a
    // short idle gap can scroll the right column.
    window.addEventListener("wheel", event => {
        if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            return;
        }
        const now = event.timeStamp;
        const idleGap = now - lastWheelTime;
        // A fresh trackpad swipe can follow the momentum tail quickly.
        // Its stronger input distinguishes it from decaying inertia.
        const freshUpwardSwipe = isSettled && isContentAtTop() &&
            event.deltaY < 0 && idleGap > 32 &&
            Math.abs(event.deltaY) > Math.max(8, Math.abs(lastWheelDelta) * 1.8);
        const gestureGap = isSettled ? 70 : 160;
        if (idleGap > gestureGap || freshUpwardSwipe) {
            wheelGestureStartedInHero = !isSettled || isReturningToHero;
            wheelGestureStartedAtContentTop = isSettled && isContentAtTop();
        }
        lastWheelTime = now;
        lastWheelDelta = event.deltaY;
    }, { capture: true, passive: true });

    workspace.addEventListener(
        "wheel",
        event => {


            /* ========================================================
            HERO RETURN IN PROGRESS
            ======================================================== */

            if (isReturningToHero) {
                return;
            }


            /* --------------------------------------------
               CASE STUDY NOT SETTLED

               Let Lenis scroll the outer document.
            ---------------------------------------- */

            if (!isSettled) {
                return;
            }


            // Preserve browser zoom and horizontal trackpad gestures.
            if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
                return;
            }

            const delta =
                getWheelDelta(event);


            if (delta === 0) {
                return;
            }


            /* --------------------------------------------
               INTERCEPT WORKSPACE SCROLL
            ---------------------------------------- */

            event.preventDefault();

            event.stopPropagation();

            if (wheelGestureStartedInHero) {
                return;
            }


            /* ============================================
               RETURN TO HERO

               When Overview is already at the top,
               another upward scroll returns the
               entire Hero into view.
            ============================================ */

            if (
                delta < 0 &&
                wheelGestureStartedAtContentTop &&
                isContentAtTop()
            ) {

                releaseToOuterPage();

                return;

            }


            /* ============================================
               BOTTOM OF CASE STUDY

               Reflection is currently the final section.
            ============================================ */

            if (
                delta > 0 &&
                isContentAtBottom()
            ) {
                return;
            }


            /* ============================================
               EASE RIGHT-HAND CONTENT
            ============================================ */

            scrollInnerBy(
                delta
            );

        },
        {
            passive: false
        }
    );


    /* ========================================================
       OUTER PAGE SCROLL EVENTS
    ======================================================== */

    window.addEventListener(
        "scroll",
        requestStudyUpdate,
        {
            passive: true
        }
    );


    lenis?.on(
        "scroll",
        requestStudyUpdate
    );


    /* ========================================================
       RESIZE
    ======================================================== */

    window.addEventListener(
        "resize",
        () => {

            lenis?.resize();
            innerLenis?.resize();


            innerTarget =
                clampInnerScroll(
                    innerTarget
                );


            requestStudyUpdate();

            requestActiveUpdate();

        }
    );


    /* ========================================================
       INITIAL HASH NAVIGATION

       Example:
       portfolio.html#visual-system

       First align the outer Case Study.
       Then position the right column.
    ======================================================== */

    const initialHash =
        window.location.hash;


    if (initialHash) {

        const target =
            document.getElementById(
                initialHash.slice(1)
            );


        if (
            target &&
            target.matches(
                "[data-study-section]"
            )
        ) {

            requestAnimationFrame(() => {

                if (!usesInternalScroller()) {
                    target.scrollIntoView({ behavior: "auto", block: "start" });
                    setActiveSection(target.id);
                    return;
                }

                alignStudy();


                requestAnimationFrame(() => {


                    scrollInnerTo(
                        getInnerTargetPosition(target),
                        true
                    );


                    setActiveSection(
                        target.id
                    );

                });

            });

        }

    }


    /* ========================================================
       REDUCED MOTION PREFERENCE CHANGES
    ======================================================== */

    const handleMotionPreferenceChange = event => {

        if (event.matches) {

            const destination =
                innerTarget;


            stopInnerEasing();


            scrollInnerTo(destination, true);


            innerTarget =
                content.scrollTop;


            /*
               Complete an ongoing Hero-return
               immediately when reduced motion is enabled.
            */

            if (isReturningToHero) {

                if (lenis) {

                    lenis.scrollTo(
                        0,
                        {
                            immediate: true
                        }
                    );

                } else {

                    window.scrollTo(
                        0,
                        0
                    );

                }


                completeHeroReturn();

            }

        }


        requestStudyUpdate();

    };


    prefersReducedMotion.addEventListener?.(
        "change",
        handleMotionPreferenceChange
    );


    /* ========================================================
       PAGE LOAD
    ======================================================== */

    window.addEventListener(
        "load",
        () => {

            lenis?.resize();
            innerLenis?.resize();

            requestStudyUpdate();

            requestActiveUpdate();

        },
        {
            once: true
        }
    );


    /* ========================================================
       INITIAL STATE
    ======================================================== */

    updateStudyState();

    updateActiveSection();


});
