
/* ============================================================
   SANIA SAJU — PORTFOLIO
   ABOUT SECTION COMPONENT

   RESPONSIBILITIES
   ------------------------------------------------------------
   - Render the About section
   - Reveal content as it becomes visible
   - Move the right-side track through three panels
   - Synchronize the track with Lenis scrolling
   - Preserve the frozen final Skills panel
   - Respect reduced-motion preferences

   RIGHT PANEL SEQUENCE
   ------------------------------------------------------------
   01 — Bio
   02 — Tools
   03 — Skills

   LENIS
   ------------------------------------------------------------
   The existing Lenis instance is exposed through:

   window.portfolioLenis

   No separate Lenis instance is created here.

============================================================ */


class AboutSection extends HTMLElement {


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


        /* ----------------------------------------------------
           ELEMENTS
        ---------------------------------------------------- */

        this.about = this.querySelector(
            ".about"
        );

        this.contentTrack = this.querySelector(
            ".about__content-track"
        );

        // Keep the end of the natural mobile content pinned while Contact
        // covers it. Re-measure after fonts, images or breakpoints change.
        this.mobileSizeObserver = new ResizeObserver(() => {
            this.style.setProperty("--about-content-height", `${this.about.offsetHeight}px`);
        });
        this.mobileSizeObserver.observe(this.about);

        this.revealItems = Array.from(
            this.querySelectorAll(
                ".about__reveal"
            )
        );


        /* ----------------------------------------------------
           STATE
        ---------------------------------------------------- */

        this.rafId = null;

        this.lenis = window.portfolioLenis || null;

        this.aboutDocumentTop = null;


        /* ----------------------------------------------------
           REDUCED MOTION
        ---------------------------------------------------- */

        this.motionPreference = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


        this.handleMotionPreferenceChange = () => {

            if (this.motionPreference.matches) {

                this.removeScrollMotion();

                this.revealObserver?.disconnect();

                this.showReducedMotionState();

                if (this.contentTrack) {
                    this.contentTrack.style.transform = "";
                }

            } else {

                this.setupRevealObserver();

                this.setupScrollMotion();

            }

        };


        this.motionPreference.addEventListener?.(
            "change",
            this.handleMotionPreferenceChange
        );


        /* ----------------------------------------------------
           INITIALIZE
        ---------------------------------------------------- */

        if (this.motionPreference.matches) {

            this.showReducedMotionState();

            return;

        }


        this.setupRevealObserver();

        this.setupScrollMotion();

    }


    /* ========================================================
       RENDER
    ======================================================== */

    render() {

        this.innerHTML = `

            <section
                class="about"
                aria-labelledby="about-title"
            >

                <!-- ==========================================
                     RIGHT — ABOUT CONTENT
                =========================================== -->

                <div class="about__content">

                    <div class="about__content-track">


                        <!-- ==================================
                             01 — BIO
                        =================================== -->

                        <div
                            class="
                                about__block
                                about__block--bio
                            "
                        >

                            <div
                                class="
                                    about__block-inner
                                    about__reveal
                                "
                            >

                                <h2 class="about__section-title">
                                    Hi! I’m Sania.
                                </h2>


                                <p class="about__intro">

                                    I’m a creator who found my way into UX
                                    while trying to figure out what kind of
                                    work felt right for me. I knew I wanted
                                    something that let me be creative, solve
                                    real problems, and make things that could
                                    actually help people.

                                    I’ve always enjoyed creating things that
                                    are useful and beautiful, and seeing
                                    someone genuinely enjoy or benefit from
                                    something I’ve made is still one of the
                                    best parts of the process.

                                    I’m naturally curious, which means I
                                    usually end up with more ideas than
                                    answers. I used to think I had to find
                                    the perfect solution, but UX has taught
                                    me that design is rarely about getting
                                    everything right the first time. It’s
                                    about thinking carefully, trying things,
                                    learning, and making them better.

                                    That’s what keeps me interested in UX:
                                    the chance to keep improving while
                                    creating experiences that make life a
                                    little easier.

                                </p>

                            </div>

                        </div>


                        <!-- ==================================
                             02 — TOOLS
                        =================================== -->

                        <div
                            class="
                                about__block
                                about__block--tools
                            "
                        >

                            <div
                                class="
                                    about__block-inner
                                    about__reveal
                                "
                            >

                                <h2 class="about__section-title">
                                    Tools I Use Frequently
                                </h2>


                                <div
                                    class="about__tools"
                                    aria-label="Tools I use frequently"
                                >

                                    <!-- FIGMA -->

                                    <span class="about__tool" tabindex="0" role="img" aria-label="Figma">
                                        <img src="./assets/icons/tools/figma.svg" alt="">
                                        <span class="about__tool-name" aria-hidden="true">Figma</span>
                                    </span>


                                    <!-- FRAMER -->

                                    <span class="about__tool" tabindex="0" role="img" aria-label="Framer">
                                        <img src="./assets/icons/tools/framer.svg" alt="">
                                        <span class="about__tool-name" aria-hidden="true">Framer</span>
                                    </span>


                                    <!-- VS CODE -->

                                    <span class="about__tool" tabindex="0" role="img" aria-label="Visual Studio Code">
                                        <img src="./assets/icons/tools/vscode.svg" alt="">
                                        <span class="about__tool-name" aria-hidden="true">Visual Studio Code</span>
                                    </span>


                                    <!-- CODEX -->

                                    <span class="about__tool" tabindex="0" role="img" aria-label="Codex">
                                        <img src="./assets/icons/tools/codex.svg" alt="">
                                        <span class="about__tool-name" aria-hidden="true">Codex</span>
                                    </span>


                                    <!-- CHATGPT -->

                                    <span class="about__tool" tabindex="0" role="img" aria-label="ChatGPT">
                                        <img src="./assets/icons/tools/chatgpt.svg" alt="">
                                        <span class="about__tool-name" aria-hidden="true">ChatGPT</span>
                                    </span>


                                    <!-- CLAUDE -->

                                    <span class="about__tool" tabindex="0" role="img" aria-label="Claude">
                                        <img src="./assets/icons/tools/claude.svg" alt="">
                                        <span class="about__tool-name" aria-hidden="true">Claude</span>
                                    </span>


                                    <!-- COPILOT -->

                                    <span class="about__tool" tabindex="0" role="img" aria-label="Copilot">
                                        <img src="./assets/icons/tools/Copilot.svg" alt="">
                                        <span class="about__tool-name" aria-hidden="true">Copilot</span>
                                    </span>


                                    <!-- GEMINI -->

                                    <span class="about__tool" tabindex="0" role="img" aria-label="Gemini">
                                        <img src="./assets/icons/tools/gemini.svg" alt="">
                                        <span class="about__tool-name" aria-hidden="true">Gemini</span>
                                    </span>


                                </div>

                            </div>

                        </div>


                        <!-- ==================================
                             03 — SKILLS
                        =================================== -->

                        <div
                            class="
                                about__block
                                about__block--skills
                            "
                        >

                            <div
                                class="
                                    about__block-inner
                                    about__reveal
                                "
                            >

                                <h2 class="about__section-title">
                                    What I’m Skilled In
                                </h2>


                                <div class="about__skills">


                                    <!-- COLUMN 01 -->

                                    <div class="about__skills-column">

                                        <span>UX Design</span>

                                        <span>UI Design</span>

                                        <span>Product Design</span>

                                        <span>Design Systems</span>

                                        <span>Interaction Design</span>

                                    </div>


                                    <!-- COLUMN 02 -->

                                    <div class="about__skills-column">

                                        <span>User Research</span>

                                        <span>Information Architecture</span>

                                        <span>Wireframing</span>

                                        <span>Prototyping</span>

                                        <span>Usability Testing</span>

                                    </div>


                                    <!-- COLUMN 03 -->

                                    <div class="about__skills-column">

                                        <span>Front-End Development</span>

                                        <span>Vibe Coding</span>

                                        <span>HTML</span>

                                        <span>CSS</span>

                                        <span>JavaScript</span>

                                    </div>


                                    <!-- COLUMN 04 -->

                                    <div class="about__skills-column">

                                        <span>Responsive Design</span>

                                        <span>Accessibility</span>

                                        <span>Content Strategy</span>

                                        <span>Brand Communication</span>

                                        <span>More</span>

                                    </div>

                                </div>

                                <!-- RESUME CTA -->

                                <a
                                    class="about__resume-cta"
                                    href="https://drive.google.com/file/d/1Tv4DNQOfUqFfgtIkCHrTz7Y5IOp73n3v/view?usp=drive_link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >

                                    <span>
                                        My Resume
                                    </span>


                                    <portfolio-arrow
                                        direction="right"
                                    ></portfolio-arrow>

                                </a>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- ==========================================
                     LEFT — STICKY ABOUT PANEL
                =========================================== -->

                <div class="about__sticky">

                    <div class="about__panel">

                        <h1
                            class="sr-only"
                            id="about-title"
                        >
                            About Me
                        </h1>


                        <img
                            class="about__panel-artwork"
                            src="./assets/images/me.webp"
                            alt=""
                            aria-hidden="true"
                        >

                    </div>

                </div>

            </section>

        `;

    }


    /* ========================================================
       CONTENT REVEAL

       IntersectionObserver handles one-time entrance
       animations for the individual content panels.

       Lenis does not need to replace IntersectionObserver.
    ======================================================== */

    setupRevealObserver() {

        if (document.documentElement.classList.contains("home-is-revealed")) {
            this.showReducedMotionState();
            return;
        }

        if (this.revealObserver) {
            this.revealObserver.disconnect();
        }


        this.revealObserver = new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    entry.target.classList.add(
                        "is-visible"
                    );


                    this.revealObserver.unobserve(
                        entry.target
                    );

                });

            },

            {
                threshold: 0.25
            }

        );


        this.revealItems.forEach(item => {

            if (!item.classList.contains("is-visible")) {

                this.revealObserver.observe(item);

            }

        });

    }


    /* ========================================================
       LENIS SCROLL POSITION

       Use the current smoothed Lenis scroll value.

       Native scrollY remains the fallback.
    ======================================================== */

    getScrollPosition() {

        if (
            this.lenis &&
            Number.isFinite(this.lenis.scroll)
        ) {

            return this.lenis.scroll;

        }


        return window.scrollY || 0;

    }


    /* ========================================================
       MEASURE ABOUT POSITION

       Store About's document-space top coordinate.

       Comparing the Lenis scroll position against this
       coordinate tells us how far About has moved
       beyond the top of the viewport.
    ======================================================== */

    measureAboutPosition() {

        if (!this.about) {

            this.aboutDocumentTop = null;

            return;

        }


        const rect =
            this.about.getBoundingClientRect();


        this.aboutDocumentTop =
            rect.top + window.scrollY;

    }


    /* ========================================================
       RIGHT PANEL SCROLL MOTION

       THREE PANELS
       ------------------------------------------------------------
       Bio    = translateY(0)
       Tools  = translateY(-100vh)
       Skills = translateY(-200vh)

       After -200vh, the track stops.

       Contact can then rise over the final About panel.

       IMPORTANT:
       Lenis supplies the smoothed scroll position.

       No second easing or lerp is applied here.
    ======================================================== */

    setupScrollMotion() {

        if (this.updateAboutMotion) {
            return;
        }


        this.lenis = window.portfolioLenis || null;


        /* ----------------------------------------------------
           UPDATE MOTION
        ---------------------------------------------------- */

        this.updateAboutMotion = () => {

            if (this.rafId !== null) {
                return;
            }


            this.rafId = window.requestAnimationFrame(() => {

                this.rafId = null;


                if (
                    !this.about ||
                    !this.contentTrack ||
                    this.aboutDocumentTop === null
                ) {
                    return;
                }


                /* ============================================
                   MEASURE
                ============================================ */

                const viewportHeight =
                    window.innerHeight || 1;


                const scrollPosition =
                    this.getScrollPosition();


                /* ============================================
                   SCROLL DISTANCE

                   The amount of smoothed document scroll
                   beyond the top of About.
                ============================================ */

                const rawScrollDistance =
                    scrollPosition -
                    this.aboutDocumentTop;


                /* ============================================
                   MAXIMUM MOVEMENT

                   Three 100vh panels require 200vh
                   of vertical translation.
                ============================================ */

                const maxScrollDistance =
                    viewportHeight * 2;


                /* ============================================
                   CLAMP MOTION

                   Before About enters:
                   distance = 0

                   Through first 200vh:
                   distance increases with Lenis scrolling

                   After 200vh:
                   distance stays at the maximum
                ============================================ */

                const scrollDistance = Math.min(

                    Math.max(
                        rawScrollDistance,
                        0
                    ),

                    maxScrollDistance

                );


                /* ============================================
                   TRANSLATE TRACK

                   One-to-one with the Lenis scroll position.
                ============================================ */

                this.contentTrack.style.transform =

                    `translate3d(
                        0,
                        ${-scrollDistance}px,
                        0
                    )`;

            });

        };


        /* ====================================================
           RESIZE

           Recalculate the About document position and
           update its translated content.
        ==================================================== */

        this.handleResize = () => {

            this.measureAboutPosition();

            this.updateAboutMotion?.();

        };


        /* ====================================================
           NATIVE SCROLL

           Provides fallback behavior if Lenis is unavailable.

           Also handles browser-driven scroll restoration.
        ==================================================== */

        window.addEventListener(
            "scroll",
            this.updateAboutMotion,
            {
                passive: true
            }
        );


        /* ====================================================
           LENIS SCROLL

           Follow Lenis's current smoothed position.

           This does not create a new scroll controller
           or animation loop.
        ==================================================== */

        if (this.lenis) {

            this.lenis.on(
                "scroll",
                this.updateAboutMotion
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
           PAGE LOAD

           Recalculate after resources have loaded.
        ==================================================== */

        this.handlePageLoad = () => {

            this.measureAboutPosition();

            this.updateAboutMotion?.();

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
           INITIAL STATE
        ==================================================== */

        this.measureAboutPosition();

        this.updateAboutMotion();

    }


    /* ========================================================
       REMOVE SCROLL MOTION

       Remove native listeners and unsubscribe from Lenis.
    ======================================================== */

    removeScrollMotion() {

        if (this.updateAboutMotion) {

            window.removeEventListener(
                "scroll",
                this.updateAboutMotion
            );


            this.lenis?.off?.(
                "scroll",
                this.updateAboutMotion
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


        this.updateAboutMotion = null;

        this.handleResize = null;

        this.handlePageLoad = null;

    }


    /* ========================================================
       REDUCED MOTION

       Reveal all content immediately.

       CSS disables the section's transformed
       scroll experience for reduced-motion users.
    ======================================================== */

    showReducedMotionState() {

        this.revealItems.forEach(item => {

            item.classList.add(
                "is-visible"
            );

        });

    }


    /* ========================================================
       CLEANUP
    ======================================================== */

    disconnectedCallback() {
        this.mobileSizeObserver?.disconnect();

        this.revealObserver?.disconnect();

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

if (!customElements.get("about-section")) {

    customElements.define(
        "about-section",
        AboutSection
    );

}
