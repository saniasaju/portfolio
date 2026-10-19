
/* ============================================================
   SANIA SAJU — PORTFOLIO
   PAGES SHOWCASE COMPONENT

   RESPONSIBILITIES
   ------------------------------------------------------------
   - Render five vertical image columns
   - Alternate column movement directions
   - Maintain seamless looping columns
   - Follow Lenis's smoothed document scroll position
   - Preserve the pinned Pages viewport
   - Preserve the Projects → Pages transition
   - Preserve the #pixels navigation target

   LENIS
   ------------------------------------------------------------
   Lenis is initialized separately in lenis.js.

   This component uses the existing instance exposed as:

   window.portfolioLenis

   No additional Lenis instance is created here.

============================================================ */


class PagesSection extends HTMLElement {


    /* ========================================================
       CONNECT
    ======================================================== */

    connectedCallback() {

        if (this.dataset.initialized === "true") {
            return;
        }

        this.dataset.initialized = "true";


        /* ----------------------------------------------------
           RENDER
        ---------------------------------------------------- */

        this.render();

        // Keep the navigation target in document space when the mobile scene pins.
        const anchor = this.querySelector(".pages-showcase__anchor");
        if (anchor) this.prepend(anchor);


        /* ----------------------------------------------------
           ELEMENTS
        ---------------------------------------------------- */

        this.section = this.querySelector(
            ".pages-showcase"
        );

        this.columns = Array.from(
            this.querySelectorAll(
                ".pages-showcase__column"
            )
        );

        this.projectThree = document.querySelector(
            "#work .project:last-child"
        );


        /* ----------------------------------------------------
           STATE
        ---------------------------------------------------- */

        this.rafId = null;

        this.lenis = window.portfolioLenis || null;

        this.projectBottomDocument = null;


        /* ----------------------------------------------------
           REDUCED MOTION
        ---------------------------------------------------- */

        this.motionPreference = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


        this.handleMotionPreferenceChange = () => {

            if (this.motionPreference.matches) {

                this.removeScrollMotion();

                this.columns.forEach(column => {
                    column.style.transform = "";
                });

            } else {

                this.setupScrollMotion();

            }

        };


        this.motionPreference.addEventListener?.(
            "change",
            this.handleMotionPreferenceChange
        );


        if (!this.motionPreference.matches) {
            this.setupScrollMotion();
        }

    }


    /* ========================================================
       RENDER
    ======================================================== */

    render() {

        /* ====================================================
           PAGE DATA

           Five columns.
           Five images per column.

           The original speed values and directions
           are preserved.
        ==================================================== */

        const columns = [

            {
                direction: "up",
                speed: 0.28,
                offset: false,

                images: [
                    "./assets/images/pages/page-01.webp",
                    "./assets/images/pages/page-02.webp",
                    "./assets/images/pages/page-03.webp",
                    "./assets/images/pages/page-04.webp",
                    "./assets/images/pages/page-05.webp"
                ]
            },

            {
                direction: "down",
                speed: 0.36,
                offset: true,

                images: [
                    "./assets/images/pages/page-06.webp",
                    "./assets/images/pages/page-07.webp",
                    "./assets/images/pages/page-08.webp",
                    "./assets/images/pages/page-09.webp",
                    "./assets/images/pages/page-10.webp"
                ]
            },

            {
                direction: "up",
                speed: 0.30,
                offset: false,

                images: [
                    "./assets/images/pages/page-11.webp",
                    "./assets/images/pages/page-12.webp",
                    "./assets/images/pages/page-13.webp",
                    "./assets/images/pages/page-14.webp",
                    "./assets/images/pages/page-15.webp"
                ]
            },

            {
                direction: "down",
                speed: 0.38,
                offset: true,

                images: [
                    "./assets/images/pages/page-16.webp",
                    "./assets/images/pages/page-17.webp",
                    "./assets/images/pages/page-18.webp",
                    "./assets/images/pages/page-19.webp",
                    "./assets/images/pages/page-20.webp"
                ]
            },

            {
                direction: "up",
                speed: 0.28,
                offset: false,

                images: [
                    "./assets/images/pages/page-21.webp",
                    "./assets/images/pages/page-22.webp",
                    "./assets/images/pages/page-23.webp",
                    "./assets/images/pages/page-24.webp",
                    "./assets/images/pages/page-25.webp"
                ]
            }

        ];


        /* ====================================================
           COLUMN MARKUP
        ==================================================== */

        const columnsMarkup = columns
            .map((column, columnIndex) => {

                const cardsMarkup = column.images
                    .map((imageSrc, imageIndex) => {

                        const globalIndex =
                            columnIndex * 5 + imageIndex + 1;


                        return `

                            <div class="pages-showcase__card">

                                <img
                                    class="pages-showcase__image"
                                    src="${imageSrc}"
                                    alt="Selected interface screen ${globalIndex}"
                                    loading="lazy"
                                    decoding="async"
                                >

                            </div>

                        `;

                    })
                    .join("");


                const offsetClass = column.offset
                    ? "pages-showcase__column--offset"
                    : "";


                return `

                    <div
                        class="
                            pages-showcase__column
                            ${offsetClass}
                        "
                        data-direction="${column.direction}"
                        data-speed="${column.speed}"
                    >

                        <!-- ORIGINAL LOOP -->

                        <div class="pages-showcase__loop">

                            ${cardsMarkup}

                        </div>


                        <!-- DUPLICATED LOOP -->

                        <div
                            class="pages-showcase__loop"
                            aria-hidden="true"
                        >

                            ${cardsMarkup}

                        </div>

                    </div>

                `;

            })
            .join("");


        /* ====================================================
           COMPONENT MARKUP
        ==================================================== */

        this.innerHTML = `

            <section
                class="pages-showcase"
                aria-label="Selected interface screens"
            >

                <!-- NAVBAR SCROLL TARGET -->

                <div
                    class="pages-showcase__anchor"
                    id="pixels"
                    aria-hidden="true"
                ></div>


                <!-- PINNED SHOWCASE VIEWPORT -->

                <div class="pages-showcase__viewport">

                    ${columnsMarkup}

                </div>

            </section>

        `;

    }


    /* ========================================================
       SCROLL POSITION

       Use Lenis's smoothed scroll position when available.

       Native window.scrollY is a fallback.

       The columns must follow the document's actual
       smoothed position, not raw wheel input.
    ======================================================== */

    getScrollPosition() {

        const lenis = this.lenis;

        if (
            lenis &&
            Number.isFinite(lenis.scroll)
        ) {
            return lenis.scroll;
        }

        return window.scrollY || 0;

    }


    /* ========================================================
       MEASURE PROJECT 03

       Convert the bottom of Project 03 into a document-space
       coordinate.

       This allows its position to be compared directly
       with the Lenis scroll value.

       Recalculate after resize or layout changes.
    ======================================================== */

    measureProjectPosition() {

        if (this.projectThree && window.matchMedia("(orientation: portrait), (min-width: 768px) and (max-width: 1280px)").matches) {
            const pinnedHeight = this.querySelector(".pages-showcase__viewport")?.clientHeight || window.innerHeight;
            this.style.setProperty("--pixels-overlap", `${pinnedHeight}px`);
        } else {
      
            this.style.removeProperty("--pixels-overlap");
        }

        if (!this.projectThree) {
            this.projectBottomDocument = null;
            return;
        }

        const rect = this.projectThree
            .getBoundingClientRect();


        this.projectBottomDocument =
            rect.bottom + window.scrollY;

    }


    /* ========================================================
       SCROLL MOTION

       The Pages section is pinned by CSS.

       These calculations only move the internal columns.
    ======================================================== */

    setupScrollMotion() {

        if (this.updateColumns) {
            return;
        }


        /* ----------------------------------------------------
           READ CURRENT LENIS INSTANCE
        ---------------------------------------------------- */

        this.lenis = window.portfolioLenis || null;


        /* ----------------------------------------------------
           UPDATE COLUMNS
        ---------------------------------------------------- */

        this.updateColumns = () => {

            /*
               Only one scheduled update per animation frame.
            */

            if (this.rafId !== null) {
                return;
            }


            this.rafId = window.requestAnimationFrame(() => {

                this.rafId = null;


                if (
                    !this.section ||
                    !this.projectThree ||
                    this.projectBottomDocument === null
                ) {
                    return;
                }


                /* ============================================
                   MEASURE
                ============================================ */

                const viewportHeight =
                    this.querySelector(".pages-showcase__viewport")?.clientHeight || window.innerHeight || 1;

                const scrollPosition =
                    this.getScrollPosition();


                /*
                   Project 03's bottom edge expressed in
                   viewport coordinates, calculated using
                   Lenis's smoothed scroll value.
                */

                const projectBottomInViewport =
                    this.projectBottomDocument -
                    scrollPosition;


                /* ============================================
                   MOTION START

                   Project 03 is 100vh tall.

                   The columns start moving when its
                   bottom reaches 50vh.

                   This preserves the trigger used in
                   your original JavaScript.
                ============================================ */

                const triggerLine =
                    viewportHeight * 0.50;


                const rawScrollDistance =
                    triggerLine -
                    projectBottomInViewport;


                const scrollDistance = Math.max(
                    rawScrollDistance,
                    0
                );


                /* ============================================
                   MOTION END

                   The maximum travel distance depends
                   on the actual height of the showcase.

                   For a 700vh track and 100vh viewport,
                   the sticky travel distance is 600vh.

                   The trigger offset is subtracted so
                   the columns stop before the pinned
                   experience finishes.
                ============================================ */

                const triggerOffset =
                    viewportHeight * 0.50;


                const maxScrollDistance = Math.max(

                    (window.matchMedia("(orientation: portrait), (min-width: 768px) and (max-width: 1280px)").matches
                        ? this.offsetHeight
                        : this.section.offsetHeight) -
                    viewportHeight -
                    triggerOffset,

                    0

                );


                const clampedScrollDistance = Math.min(
                    scrollDistance,
                    maxScrollDistance
                );


                /* ============================================
                   COLUMN TRANSFORMS
                ============================================ */

                this.columns.forEach(column => {


                    /* ----------------------------------------
                       COLUMN SETTINGS
                    ---------------------------------------- */

                    const speed = Number.parseFloat(
                        column.dataset.speed
                    ) || 0;


                    const direction =
                        column.dataset.direction;


                    const firstLoop = column.querySelector(
                        ".pages-showcase__loop"
                    );


                    if (!firstLoop) {
                        return;
                    }


                    /* ----------------------------------------
                       LOOP HEIGHT
                    ---------------------------------------- */

                    const cycleHeight =
                        firstLoop.offsetHeight;


                    if (cycleHeight <= 0) {
                        return;
                    }


                    /* ----------------------------------------
                       LENIS-DRIVEN TRAVEL DISTANCE

                       Lenis already smooths scrollPosition.

                       Do not introduce another lerp or
                       easing calculation here.
                    ---------------------------------------- */

                    const travelledDistance =
                        clampedScrollDistance * speed;


                    /*
                       Wrap movement once it reaches the
                       height of one complete image loop.
                    */

                    const loopProgress =
                        travelledDistance % cycleHeight;


                    /* ----------------------------------------
                       DIRECTION
                    ---------------------------------------- */

                    let translateY;


                    if (direction === "down") {

                        /*
                           Start one loop above the natural
                           position and move downward.

                           This preserves the original
                           continuous-loop behavior.
                        */

                        translateY =
                            -cycleHeight + loopProgress;

                    } else {

                        /*
                           Move upward through the first loop,
                           then wrap back to the beginning.
                        */

                        translateY =
                            -loopProgress;

                    }


                    /* ----------------------------------------
                       APPLY TRANSFORM
                    ---------------------------------------- */

                    column.style.transform =

                        `translate3d(
                            0,
                            ${translateY}px,
                            0
                        )`;

                });

            });

        };


        /* ====================================================
           RESIZE

           Update the measured Project position and
           recalculate column transforms.
        ==================================================== */

        this.handleResize = () => {

            this.measureProjectPosition();

            this.updateColumns?.();

        };


        /* ====================================================
           NATIVE SCROLL

           Retained as a fallback when Lenis isn't available.

           Also handles browser-driven scroll restoration.
        ==================================================== */

        window.addEventListener(
            "scroll",
            this.updateColumns,
            {
                passive: true
            }
        );


        /* ====================================================
           LENIS SCROLL

           This is the main update source when Lenis is active.

           Each Lenis scroll event represents its current
           smoothed scroll state.
        ==================================================== */

        if (this.lenis) {

            this.lenis.on(
                "scroll",
                this.updateColumns
            );

        }


        /* ====================================================
           RESIZE
        ==================================================== */

        window.addEventListener(
            "resize",
            this.handleResize
        );


        /* ====================================================
           RE-MEASURE AFTER IMAGES LOAD

           Image sizes may affect layout measurements.

           Refresh the stored Project position when all
           page resources have finished loading.
        ==================================================== */

        this.handlePageLoad = () => {

            this.measureProjectPosition();

            this.updateColumns?.();

        };


        if (document.readyState === "complete") {

            this.handlePageLoad();

        } else {

            window.addEventListener(
                "load",
                this.handlePageLoad,
                {
                    once: true
                }
            );

        }


        /* ====================================================
           INITIAL POSITION
        ==================================================== */

        this.measureProjectPosition();

        this.updateColumns();

    }


    /* ========================================================
       REMOVE SCROLL MOTION
    ======================================================== */

    removeScrollMotion() {

        if (this.updateColumns) {

            window.removeEventListener(
                "scroll",
                this.updateColumns
            );

            this.lenis?.off?.(
                "scroll",
                this.updateColumns
            );

        }


        if (this.handleResize) {

            window.removeEventListener(
                "resize",
                this.handleResize
            );

        }


        if (this.handlePageLoad) {

            window.removeEventListener(
                "load",
                this.handlePageLoad
            );

        }


        if (this.rafId !== null) {

            window.cancelAnimationFrame(
                this.rafId
            );

            this.rafId = null;

        }


        this.updateColumns = null;

        this.handleResize = null;

        this.handlePageLoad = null;

    }


    /* ========================================================
       CLEANUP
    ======================================================== */

    disconnectedCallback() {

        this.removeScrollMotion();


        this.motionPreference?.removeEventListener?.(
            "change",
            this.handleMotionPreferenceChange
        );


        this.dataset.initialized = "false";

    }

}


/* ============================================================
   REGISTER COMPONENT
============================================================ */

if (!customElements.get("pages-section")) {

    customElements.define(
        "pages-section",
        PagesSection
    );

}
