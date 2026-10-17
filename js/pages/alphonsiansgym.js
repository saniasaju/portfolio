/* ============================================================
   SANIA SAJU — ALPHONSIANS' GYM CASE STUDY

   Responsibilities
   ------------------------------------------------------------
   - Make shared navbar links return to the homepage
   - Detect when the Case Study has settled below the navbar
   - Enable internal Case Study scrolling only after settling
   - Release scrolling back to the page at the content edges
   - Highlight the active Contents item
   - Navigate through the Contents
   - Route sidebar wheel movement to the right content panel
============================================================ */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* ====================================================
           ELEMENTS
        ==================================================== */

        const navbar =
            document.querySelector(
                ".gym-page__navbar"
            );


        const study =
            document.querySelector(
                ".gym-study"
            );


        const workspace =
            document.querySelector(
                ".gym-study__workspace"
            );


        const content =
            document.querySelector(
                ".gym-study__content"
            );


        const tocLinks =
            Array.from(
                document.querySelectorAll(
                    ".gym-study__toc-link"
                )
            );


        const sections =
            Array.from(
                document.querySelectorAll(
                    "[data-study-section]"
                )
            );


        if (
            !study ||
            !workspace ||
            !content
        ) {
            return;
        }



        /* ====================================================
           CASE-STUDY NAVBAR LINKS

           The shared navbar uses homepage hashes. Because this
           page lives inside /pages/, route those links back to
           home.html while preserving each homepage anchor.
        ==================================================== */

        const homepageTargets =
            new Map([
                ["#home", "../home.html#home"],
                ["#work", "../home.html#work"],
                ["#pixels", "../home.html#pixels"],
                ["#about", "../home.html#about"],
                ["#contact", "../home.html#contact"]
            ]);


        if (navbar) {

            navbar
                .querySelectorAll(
                    "a[href]"
                )
                .forEach(
                    link => {

                        const href =
                            link.getAttribute(
                                "href"
                            );


                        if (
                            href &&
                            homepageTargets.has(
                                href
                            )
                        ) {

                            link.setAttribute(
                                "href",
                                homepageTargets.get(
                                    href
                                )
                            );

                        }

                    }
                );

        }



        /* ====================================================
           REDUCED MOTION
        ==================================================== */

        const prefersReducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );



        /* ====================================================
           STATE
        ==================================================== */

        let isSettled =
            false;


        let pageRafId =
            null;


        let contentRafId =
            null;



        /* ====================================================
           RESPONSIVE MODE
        ==================================================== */

        const usesInternalScroller =
            () => {

                return window.matchMedia(
                    "(orientation: landscape) and (max-width: 767px), (orientation: landscape) and (min-width: 1281px)"
                ).matches;

            };



        /* ====================================================
           HELPERS
        ==================================================== */

        const getNavbarHeight =
            () => {

                return navbar
                    ? navbar
                        .getBoundingClientRect()
                        .height
                    : 0;

            };



        /* ====================================================
           CASE STUDY SETTLED STATE

           On desktop, the Case Study settles immediately below
           the sticky navbar. Only after that point does its
           right-hand content column become scrollable.
        ==================================================== */

        const updateStudyState =
            () => {

                pageRafId =
                    null;


                if (
                    !usesInternalScroller()
                ) {

                    isSettled =
                        false;


                    study.classList.remove(
                        "is-settled"
                    );


                    return;

                }


                const studyRect =
                    study.getBoundingClientRect();


                const navbarHeight =
                    getNavbarHeight();


                const shouldSettle =
                    studyRect.top <=
                    navbarHeight + 2;


                if (
                    shouldSettle ===
                    isSettled
                ) {
                    return;
                }


                isSettled =
                    shouldSettle;


                study.classList.toggle(
                    "is-settled",
                    isSettled
                );

            };



        /* ====================================================
           REQUEST STUDY UPDATE
        ==================================================== */

        const requestStudyUpdate =
            () => {

                if (pageRafId) {
                    return;
                }


                pageRafId =
                    requestAnimationFrame(
                        updateStudyState
                    );

            };


        window.addEventListener(
            "scroll",
            requestStudyUpdate,
            {
                passive: true
            }
        );


        window.addEventListener(
            "resize",
            requestStudyUpdate
        );



        /* ====================================================
           ACTIVE CONTENTS ITEM
        ==================================================== */

        const setActiveSection =
            id => {

                tocLinks.forEach(
                    link => {

                        const isActive =
                            link.getAttribute(
                                "href"
                            ) ===
                            `#${id}`;


                        link.classList.toggle(
                            "is-active",
                            isActive
                        );


                        if (isActive) {

                            link.setAttribute(
                                "aria-current",
                                "true"
                            );

                        }

                        else {

                            link.removeAttribute(
                                "aria-current"
                            );

                        }

                    }
                );

            };



        /* ====================================================
           DETECT ACTIVE SECTION

           A marker 96px below the internal viewport top
           determines which Contents item is current.
        ==================================================== */

        const updateActiveSection =
            () => {

                contentRafId =
                    null;


                if (
                    sections.length === 0
                ) {
                    return;
                }


                const contentRect =
                    content
                        .getBoundingClientRect();


                const markerY =
                    contentRect.top +
                    96;


                let activeSection =
                    sections[0];


                sections.forEach(
                    section => {

                        const sectionRect =
                            section
                                .getBoundingClientRect();


                        if (
                            sectionRect.top <=
                            markerY
                        ) {

                            activeSection =
                                section;

                        }

                    }
                );


                setActiveSection(
                    activeSection.id
                );

            };



        const requestActiveUpdate =
            () => {

                if (contentRafId) {
                    return;
                }


                contentRafId =
                    requestAnimationFrame(
                        updateActiveSection
                    );

            };


        content.addEventListener(
            "scroll",
            requestActiveUpdate,
            {
                passive: true
            }
        );



        /* ====================================================
           CONTENTS NAVIGATION
        ==================================================== */

        tocLinks.forEach(
            link => {

                link.addEventListener(
                    "click",
                    event => {

                        const href =
                            link.getAttribute(
                                "href"
                            );


                        if (
                            !href ||
                            !href.startsWith("#")
                        ) {
                            return;
                        }


                        const target =
                            document.querySelector(
                                href
                            );


                        if (!target) {
                            return;
                        }


                        /*
                           Small screens use normal document
                           scrolling because the nested scroller
                           is intentionally released.
                        */

                        if (
                            !usesInternalScroller()
                        ) {

                            return;

                        }


                        event.preventDefault();


                        const contentRect =
                            content
                                .getBoundingClientRect();


                        const targetRect =
                            target
                                .getBoundingClientRect();


                        const targetTop =
                            content.scrollTop +
                            (
                                targetRect.top -
                                contentRect.top
                            );


                        content.scrollTo({

                            top:
                                targetTop,

                            behavior:
                                prefersReducedMotion.matches
                                    ? "auto"
                                    : "smooth"

                        });


                        setActiveSection(
                            target.id
                        );


                        history.replaceState(
                            null,
                            "",
                            href
                        );

                    }
                );

            }
        );



        /* ====================================================
           SIDEBAR WHEEL ROUTING

           Once settled, scrolling over either the Contents or
           Case Studies side of the stationary sidebar should
           continue scrolling the right-side case-study panel.

           At the top or bottom boundary, scrolling is released
           to the outer document.
        ==================================================== */

        workspace.addEventListener(
            "wheel",
            event => {

                if (
                    !usesInternalScroller() ||
                    !isSettled
                ) {
                    return;
                }


                if (
                    event.target.closest(
                        ".gym-study__content"
                    )
                ) {
                    return;
                }


                const delta =
                    event.deltaY;


                const atTop =
                    content.scrollTop <= 1;


                const atBottom =
                    content.scrollTop +
                    content.clientHeight >=
                    content.scrollHeight - 1;


                if (
                    delta < 0 &&
                    atTop
                ) {
                    return;
                }


                if (
                    delta > 0 &&
                    atBottom
                ) {
                    return;
                }


                event.preventDefault();


                content.scrollBy({

                    top:
                        delta,

                    behavior:
                        "auto"

                });

            },
            {
                passive: false
            }
        );



        /* ====================================================
           HASH ON INITIAL PAGE LOAD
        ==================================================== */

        const initialHash =
            window.location.hash;


        if (initialHash) {

            const target =
                document.querySelector(
                    initialHash
                );


            if (
                target &&
                target.matches(
                    "[data-study-section]"
                )
            ) {

                requestAnimationFrame(
                    () => {

                        /*
                           On the desktop case-study layout, first
                           settle the outer section under the
                           navbar, then position the inner panel.
                        */

                        if (
                            usesInternalScroller()
                        ) {

                            const studyRect =
                                study
                                    .getBoundingClientRect();


                            const navbarHeight =
                                getNavbarHeight();


                            const destination =
                                window.scrollY +
                                studyRect.top -
                                navbarHeight;


                            window.scrollTo({

                                top:
                                    Math.max(
                                        destination,
                                        0
                                    ),

                                behavior:
                                    "auto"

                            });


                            requestAnimationFrame(
                                () => {

                                    updateStudyState();


                                    const contentRect =
                                        content
                                            .getBoundingClientRect();


                                    const targetRect =
                                        target
                                            .getBoundingClientRect();


                                    const targetTop =
                                        content.scrollTop +
                                        (
                                            targetRect.top -
                                            contentRect.top
                                        );


                                    content.scrollTo({

                                        top:
                                            targetTop,

                                        behavior:
                                            "auto"

                                    });


                                    setActiveSection(
                                        target.id
                                    );

                                }
                            );


                            return;

                        }


                        /*
                           Small-screen fallback uses standard
                           document scrolling.
                        */

                        target.scrollIntoView({

                            behavior:
                                "auto",

                            block:
                                "start"

                        });


                        setActiveSection(
                            target.id
                        );

                    }
                );

            }

        }



        /* ====================================================
           INITIAL STATE
        ==================================================== */

        updateStudyState();

        updateActiveSection();

    }
);
