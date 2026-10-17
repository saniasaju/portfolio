
/* ============================================================
   SANIA SAJU — PORTFOLIO
   CONTACT SECTION COMPONENT

   RESPONSIBILITIES
   ------------------------------------------------------------
   - Render the Contact section
   - Reveal the Contact navbar
   - Synchronize navbar visibility with Lenis
   - Open and close the Contact form panel
   - Manage keyboard focus
   - Handle email-copy feedback
   - Validate and submit the Contact form
   - Protect textarea scrolling from Lenis
   - Clean up event listeners and timers

   STATE 1
   ------------------------------------------------------------
   Contact Main = 100%
   Form Panel   = off-screen

   STATE 2
   ------------------------------------------------------------
   Contact Main = 60%
   Form Panel   = 40%

============================================================ */


/* ============================================================
   CONFIG
============================================================ */

const CONTACT_FORM_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbzDtUROAY0SzsNtrkYU3_WqKfMaSUxQ_L6DPxIhlbRk2In6w7jIjVWCgTPi-IdiBDKtbA/exec";

const CONTACT_SENT_FEEDBACK_DURATION = 5000;

const CONTACT_COPY_FEEDBACK_DURATION = 1500;


/* ============================================================
   CONTACT SECTION COMPONENT
============================================================ */

class ContactSection extends HTMLElement {


    /* ========================================================
       CONNECT
    ======================================================== */

    connectedCallback() {

        if (this.dataset.initialized === "true") {
            return;
        }

        this.dataset.initialized = "true";

        this._cleanupFunctions = [];

        this._copyFeedbackTimer = null;
        this._panelFocusTimer = null;
        this._panelInertTimer = null;
        this._restoreFocusTimer = null;
        this._submitResetTimer = null;
        this._navbarRafId = null;


        /* ====================================================
           RENDER
        ==================================================== */

        this.render();

        /* ============================================================
   CONTACT VIEWPORT HEIGHT

   Synchronize the Contact section with the height used
   by the browser's document scroll boundary.

   Keep the value responsive to viewport changes.
============================================================ */

const syncContactViewportHeight = () => {

    this.style.setProperty(
        "--contact-viewport-height",
        `${window.innerHeight}px`
    );

    window.portfolioLenis?.resize();

};

syncContactViewportHeight();

window.addEventListener(
    "resize",
    syncContactViewportHeight
);

this._cleanupFunctions.push(() => {

    window.removeEventListener(
        "resize",
        syncContactViewportHeight
    );

});


        /* ====================================================
           ELEMENTS
        ==================================================== */

        const contact = this.querySelector(
            ".contact"
        );

        const panel = this.querySelector(
            ".contact-panel"
        );

        const openButton = this.querySelector(
            ".contact__open"
        );

        const closeButton = this.querySelector(
            ".contact-panel__close"
        );

        const form = this.querySelector(
            ".contact-form"
        );

        const nameField = this.querySelector(
            "#contact-name"
        );

        const subjectField = this.querySelector(
            "#contact-subject"
        );

        const nameCounter = this.querySelector(
            "#contact-name-count"
        );

        const subjectCounter = this.querySelector(
            "#contact-subject-count"
        );

        const emailCopyButton = this.querySelector(
            ".contact__email-copy"
        );

        const copyFeedback = emailCopyButton?.querySelector(
            ".copy-feedback"
        );

        const submitButton = this.querySelector(
            ".contact-form__submit"
        );

        const submitButtonLabel = submitButton?.querySelector(
            ".contact-form__submit-label"
        );


        /* ====================================================
           SETTINGS
        ==================================================== */

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        const lenis = window.portfolioLenis || null;


        /* ====================================================
           MANAGED EVENT LISTENERS

           All managed listeners are removed when the
           component disconnects.
        ==================================================== */

        const addManagedListener = (
            target,
            eventName,
            handler,
            options
        ) => {

            if (!target) {
                return;
            }

            target.addEventListener(
                eventName,
                handler,
                options
            );

            this._cleanupFunctions.push(() => {

                target.removeEventListener(
                    eventName,
                    handler,
                    options
                );

            });

        };


        /* ====================================================
           STATE
        ==================================================== */

        let lastFocusedElement = null;
        let panelPlaceholder = null;
        const restorePanelPosition = () => {
            if (!panelPlaceholder) return;
            panelPlaceholder.before(panel);
            panelPlaceholder.remove();
            panelPlaceholder = null;
            panel.classList.remove("mobile-contact-panel", "is-closing");
            panel.style.removeProperty("--contact-transition-duration");
            panel.style.removeProperty("--contact-transition-easing");
        };
        this._cleanupFunctions.push(restorePanelPosition);

        let navbarHasRevealed = false;


        /* ====================================================
           CONTACT NAVBAR ENTRANCE
        ==================================================== */

        const revealContactNavbar = () => {

            if (
                navbarHasRevealed ||
                !contact
            ) {
                return;
            }

            navbarHasRevealed = true;

            contact.classList.add(
                "is-navbar-visible"
            );


            /* --------------------------------------------
               STOP OBSERVING AFTER FIRST REVEAL
            -------------------------------------------- */

            window.removeEventListener(
                "scroll",
                this.handleNavbarReveal
            );

            window.removeEventListener(
                "resize",
                this.handleNavbarReveal
            );

            lenis?.off?.(
                "scroll",
                this.handleNavbarReveal
            );


            if (this._navbarRafId !== null) {

                window.cancelAnimationFrame(
                    this._navbarRafId
                );

                this._navbarRafId = null;

            }

        };


        /* ====================================================
           CHECK NAVBAR VISIBILITY
        ==================================================== */

        const checkNavbarVisibility = () => {

            if (
                !contact ||
                navbarHasRevealed
            ) {
                return;
            }


            const rect =
                contact.getBoundingClientRect();


            const viewportHeight =
                window.innerHeight || 1;


            /*
               Reveal when Contact reaches 50% of
               the viewport height.
            */

            const revealLine =
                viewportHeight * 0.5;


            if (
                rect.top <= revealLine &&
                rect.bottom > revealLine
            ) {

                revealContactNavbar();

            }

        };


        /* ====================================================
           SCHEDULE NAVBAR UPDATE

           Limit layout checks to one animation frame.
        ==================================================== */

        this.handleNavbarReveal = () => {

            if (
                navbarHasRevealed ||
                this._navbarRafId !== null
            ) {
                return;
            }


            this._navbarRafId =
                window.requestAnimationFrame(() => {

                    this._navbarRafId = null;

                    checkNavbarVisibility();

                });

        };


        /* ====================================================
           INITIALIZE NAVBAR REVEAL
        ==================================================== */

        if (
            prefersReducedMotion.matches ||
            document.documentElement.classList.contains("home-is-revealed")
        ) {

            revealContactNavbar();

        } else {

            /* --------------------------------------------
               NATIVE SCROLL
            -------------------------------------------- */

            addManagedListener(
                window,
                "scroll",
                this.handleNavbarReveal,
                {
                    passive: true
                }
            );


            /* --------------------------------------------
               RESIZE
            -------------------------------------------- */

            addManagedListener(
                window,
                "resize",
                this.handleNavbarReveal
            );


            /* --------------------------------------------
               LENIS SCROLL
            -------------------------------------------- */

            if (lenis) {

                lenis.on(
                    "scroll",
                    this.handleNavbarReveal
                );


                this._cleanupFunctions.push(() => {

                    lenis.off?.(
                        "scroll",
                        this.handleNavbarReveal
                    );

                });

            }


            /* --------------------------------------------
               INITIAL CHECK

               Handles direct navigation and restored
               scroll positions.
            -------------------------------------------- */

            checkNavbarVisibility();

        }


        /* ====================================================
           TRANSITION DURATION
        ==================================================== */

        const getTransitionDuration = () => {

            if (
                prefersReducedMotion.matches ||
                !contact
            ) {
                return 0;
            }


            const value = getComputedStyle(contact)
                .getPropertyValue(
                    "--contact-transition-duration"
                )
                .trim();


            if (value.endsWith("ms")) {

                return Number.parseFloat(value) || 0;

            }


            if (value.endsWith("s")) {

                return (
                    Number.parseFloat(value) || 0
                ) * 1000;

            }


            return 900;

        };


        /* ====================================================
           PANEL TIMERS
        ==================================================== */

        const clearPanelTimers = () => {

            window.clearTimeout(
                this._panelFocusTimer
            );

            window.clearTimeout(
                this._panelInertTimer
            );

            window.clearTimeout(
                this._restoreFocusTimer
            );


            this._panelFocusTimer = null;

            this._panelInertTimer = null;

            this._restoreFocusTimer = null;

        };


        /* ====================================================
           OPEN CONTACT PANEL
        ==================================================== */

        const openPanel = () => {

            if (
                !contact ||
                !panel ||
                !openButton ||
                contact.classList.contains(
                    "contact--form-open"
                )
            ) {
                return;
            }


            clearPanelTimers();


            /* --------------------------------------------
               REMEMBER FOCUS
            -------------------------------------------- */

            lastFocusedElement =
                document.activeElement;


            /* --------------------------------------------
               OPEN PANEL
            -------------------------------------------- */

            contact.classList.add(
                "contact--form-open"
            );
            contact.classList.remove("contact--form-closing");
            panel.classList.remove("is-closing");
            if (window.matchMedia("(orientation: portrait), (min-width: 768px) and (max-width: 1280px)").matches && !panelPlaceholder) {
                panelPlaceholder = document.createComment("Contact form position");
                panel.before(panelPlaceholder);
                const styles = getComputedStyle(contact);
                panel.style.setProperty("--contact-transition-duration", styles.getPropertyValue("--contact-transition-duration"));
                panel.style.setProperty("--contact-transition-easing", styles.getPropertyValue("--contact-transition-easing"));
                panel.classList.add("mobile-contact-panel");
                document.body.append(panel);
                // Paint its off-screen position before revealing the overlay.
                panel.getBoundingClientRect();
            }


            panel.inert = false;


            panel.setAttribute(
                "aria-hidden",
                "false"
            );


            panel.classList.add(
                "is-open"
            );


            openButton.setAttribute(
                "aria-expanded",
                "true"
            );


            /* --------------------------------------------
               MOVE FOCUS AFTER PANEL TRANSITION
            -------------------------------------------- */

            this._panelFocusTimer =
                window.setTimeout(() => {

                    nameField?.focus();

                    this._panelFocusTimer = null;

                }, getTransitionDuration());

        };


        /* ====================================================
           CLOSE CONTACT PANEL
        ==================================================== */

        const closePanel = () => {

            if (
                !contact ||
                !panel ||
                !openButton ||
                !contact.classList.contains(
                    "contact--form-open"
                )
            ) {
                return;
            }


            clearPanelTimers();


            /* --------------------------------------------
               CLOSE PANEL
            -------------------------------------------- */

            contact.classList.add("contact--form-closing");
            panel.classList.add("is-closing");
            contact.classList.remove(
                "contact--form-open"
            );


            panel.classList.remove(
                "is-open"
            );


            panel.setAttribute(
                "aria-hidden",
                "true"
            );


            openButton.setAttribute(
                "aria-expanded",
                "false"
            );


            const transitionDuration =
                getTransitionDuration();


            /* --------------------------------------------
               RESTORE INERT STATE
            -------------------------------------------- */

            this._panelInertTimer =
                window.setTimeout(() => {

                    panel.inert = true;
                    contact.classList.remove("contact--form-closing");
                    restorePanelPosition();

                    this._panelInertTimer = null;

                }, transitionDuration);


            /* --------------------------------------------
               RESTORE FOCUS
            -------------------------------------------- */

            if (
                lastFocusedElement instanceof HTMLElement
            ) {

                this._restoreFocusTimer =
                    window.setTimeout(() => {

                        lastFocusedElement.focus({
                            preventScroll: true
                        });

                        this._restoreFocusTimer = null;

                    }, transitionDuration);

            }

        };


        /* ====================================================
           OPEN / CLOSE EVENTS
        ==================================================== */

        addManagedListener(
            openButton,
            "click",
            openPanel
        );


        addManagedListener(
            closeButton,
            "click",
            closePanel
        );


        /* ====================================================
           ESCAPE TO CLOSE
        ==================================================== */

        this.handleEscape = event => {

            if (
                event.key === "Escape" &&
                panel?.classList.contains("is-open")
            ) {

                closePanel();

            }

        };


        addManagedListener(
            document,
            "keydown",
            this.handleEscape
        );


        /* ====================================================
           FOCUS TRAP

           Keyboard focus remains inside the open
           contact panel.
        ==================================================== */

        const handlePanelKeydown = event => {

            if (
                event.key !== "Tab" ||
                !panel?.classList.contains("is-open")
            ) {
                return;
            }


            const focusableElements = Array.from(
                panel.querySelectorAll(
                    `
                    button:not([disabled]),
                    input:not([disabled]):not([tabindex="-1"]),
                    textarea:not([disabled]),
                    select:not([disabled]),
                    a[href]
                    `
                )
            ).filter(element => {

                return !element.closest(
                    '[aria-hidden="true"]'
                );

            });


            if (!focusableElements.length) {
                return;
            }


            const firstFocusable =
                focusableElements[0];


            const lastFocusable =
                focusableElements[
                    focusableElements.length - 1
                ];


            /* --------------------------------------------
               SHIFT + TAB
            -------------------------------------------- */

            if (
                event.shiftKey &&
                document.activeElement === firstFocusable
            ) {

                event.preventDefault();

                lastFocusable.focus();

                return;

            }


            /* --------------------------------------------
               TAB
            -------------------------------------------- */

            if (
                !event.shiftKey &&
                document.activeElement === lastFocusable
            ) {

                event.preventDefault();

                firstFocusable.focus();

            }

        };


        addManagedListener(
            panel,
            "keydown",
            handlePanelKeydown
        );


        /* ====================================================
           CHARACTER COUNTERS
        ==================================================== */

        const setupCharacterCounter = (
            input,
            counter
        ) => {

            if (
                !input ||
                !counter
            ) {
                return;
            }


            const maxLength =
                input.maxLength;


            const warningThreshold =
                Math.floor(maxLength * 0.8);


            const nearLimitThreshold =
                Math.floor(maxLength * 0.95);


            const updateCounter = () => {

                const currentLength =
                    input.value.length;


                counter.textContent =
                    `${currentLength} / ${maxLength}`;


                counter.classList.toggle(
                    "is-visible",
                    currentLength >= warningThreshold
                );


                counter.classList.toggle(
                    "is-near-limit",
                    currentLength >= nearLimitThreshold
                );

            };


            addManagedListener(
                input,
                "input",
                updateCounter
            );


            updateCounter();

        };


        /* ====================================================
           RESET CHARACTER COUNTER
        ==================================================== */

        const resetCharacterCounter = (
            counter,
            value
        ) => {

            if (!counter) {
                return;
            }


            counter.textContent = value;


            counter.classList.remove(
                "is-visible",
                "is-near-limit"
            );

        };


        /* ====================================================
           INITIALIZE CHARACTER COUNTERS
        ==================================================== */

        setupCharacterCounter(
            nameField,
            nameCounter
        );


        setupCharacterCounter(
            subjectField,
            subjectCounter
        );


        /* ====================================================
           COPY EMAIL FEEDBACK
        ==================================================== */

        const showCopyFeedback = () => {

            if (!copyFeedback) {
                return;
            }


            window.clearTimeout(
                this._copyFeedbackTimer
            );


            copyFeedback.classList.add(
                "is-visible"
            );


            this._copyFeedbackTimer =
                window.setTimeout(() => {

                    copyFeedback.classList.remove(
                        "is-visible"
                    );

                    this._copyFeedbackTimer = null;

                }, CONTACT_COPY_FEEDBACK_DURATION);

        };


        /* ====================================================
           COPY EMAIL FALLBACK
        ==================================================== */

        const fallbackCopyEmail = email => {

            const temporaryTextarea =
                document.createElement("textarea");


            temporaryTextarea.value = email;


            temporaryTextarea.setAttribute(
                "readonly",
                ""
            );


            Object.assign(
                temporaryTextarea.style,
                {
                    position: "fixed",
                    top: "0",
                    left: "-9999px",
                    opacity: "0"
                }
            );


            document.body.appendChild(
                temporaryTextarea
            );


            temporaryTextarea.select();


            temporaryTextarea.setSelectionRange(
                0,
                temporaryTextarea.value.length
            );


            const successful =
                document.execCommand("copy");


            temporaryTextarea.remove();


            emailCopyButton?.focus({
                preventScroll: true
            });


            return successful;

        };


        /* ====================================================
           COPY EMAIL
        ==================================================== */

        const handleEmailCopy = async () => {

            const email =
                emailCopyButton?.dataset.email;


            if (!email) {
                return;
            }


            let copied = false;


            /* --------------------------------------------
               CLIPBOARD API
            -------------------------------------------- */

            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {

                try {

                    await navigator.clipboard.writeText(
                        email
                    );

                    copied = true;

                } catch (error) {

                    copied = false;

                }

            }


            /* --------------------------------------------
               FALLBACK
            -------------------------------------------- */

            if (!copied) {

                try {

                    copied = fallbackCopyEmail(
                        email
                    );

                } catch (error) {

                    copied = false;

                }

            }


            /* --------------------------------------------
               SUCCESS
            -------------------------------------------- */

            if (copied) {

                showCopyFeedback();

            }

        };


        addManagedListener(
            emailCopyButton,
            "click",
            handleEmailCopy
        );


        /* ====================================================
           FORM SUBMISSION
        ==================================================== */

        const setSubmitLabel = label => {

            if (submitButtonLabel) {

                submitButtonLabel.textContent =
                    label;

            }

        };


        addManagedListener(form, "input", event => {
            if (typeof event.target.setCustomValidity === "function") {
                event.target.setCustomValidity("");
            }
        });

        const handleSubmit = async event => {

            event.preventDefault();


            if (
                !form ||
                !submitButton
            ) {
                return;
            }


            /* --------------------------------------------
               VALIDATION
            -------------------------------------------- */

            // Client checks improve feedback; the endpoint must enforce these too.
            const limits = { name: 60, email: 120, subject: 100, message: 5000 };
            for (const [key, limit] of Object.entries(limits)) {
                const field = form.elements.namedItem(key);
                const value = field.value.trim();
                field.setCustomValidity(
                    value.length > limit ? `Use at most ${limit} characters.` :
                    field.required && !value ? "Please fill out this field." : ""
                );
            }
            if (form.elements.namedItem("website").value) return;

            if (!form.checkValidity()) {

                form.reportValidity();

                return;

            }


            /* --------------------------------------------
               PREVENT DOUBLE SUBMISSION
            -------------------------------------------- */

            if (submitButton.disabled) {
                return;
            }


            /* --------------------------------------------
               CLEAR SUCCESS TIMER
            -------------------------------------------- */

            window.clearTimeout(
                this._submitResetTimer
            );


            this._submitResetTimer = null;


            /* --------------------------------------------
               SENDING STATE
            -------------------------------------------- */

            submitButton.disabled = true;


            submitButton.setAttribute(
                "aria-disabled",
                "true"
            );


            form.setAttribute(
                "aria-busy",
                "true"
            );


            setSubmitLabel(
                "Sending..."
            );


            /* --------------------------------------------
               PREPARE FORM DATA
            -------------------------------------------- */

            const formData =
                new FormData(form);


            const body =
                new URLSearchParams();


            for (const key of ["name", "email", "subject", "message", "website"]) {
                body.append(key, String(formData.get(key) || "").trim());
            }


            /* --------------------------------------------
               SUBMIT
            -------------------------------------------- */

            const controller = new AbortController();
            this._submitController = controller;
            const timeout = window.setTimeout(() => controller.abort(), 15000);
            try {

                const response = await fetch(
                    CONTACT_FORM_ENDPOINT,
                    {
                        method: "POST",
                        body: body,
                        signal: controller.signal,
                        credentials: "omit",
                        referrerPolicy: "no-referrer",
                        cache: "no-store"
                    }
                );


                if (!response.ok) {

                    throw new Error(
                        `HTTP ${response.status}`
                    );

                }


                const result =
                    await response.json();


                if (!result || result.ok !== true) {

                    throw new Error(
                        "Submission failed."
                    );

                }


                /* ----------------------------------------
                   SUCCESS
                ---------------------------------------- */

                form.reset();


                resetCharacterCounter(
                    nameCounter,
                    "0 / 60"
                );


                resetCharacterCounter(
                    subjectCounter,
                    "0 / 100"
                );


                setSubmitLabel(
                    "Sent!"
                );


                this._submitResetTimer =
                    window.setTimeout(() => {

                        setSubmitLabel(
                            "Send"
                        );

                        this._submitResetTimer = null;

                    }, CONTACT_SENT_FEEDBACK_DURATION);

            }


            /* --------------------------------------------
               ERROR
            -------------------------------------------- */

            catch (error) {

                console.error(
                    "Contact form error:",
                    error
                );


                setSubmitLabel(
                    "Try Again"
                );

            }


            /* --------------------------------------------
               FINISH
            -------------------------------------------- */

            finally {
                window.clearTimeout(timeout);
                if (this._submitController === controller) this._submitController = null;

                submitButton.disabled = false;


                submitButton.removeAttribute(
                    "aria-disabled"
                );


                form.removeAttribute(
                    "aria-busy"
                );

            }

        };


        addManagedListener(
            form,
            "submit",
            handleSubmit
        );

    }


    /* ========================================================
       RENDER MARKUP
    ======================================================== */

    render() {

        this.innerHTML = `

            <section
                class="contact"
                aria-labelledby="contact-title"
            >

                <!-- ======================================
                     CONTACT MAIN
                ======================================= -->

                <div class="contact__main">


                    <!-- ==================================
                         NAVBAR
                    =================================== -->
                    <div class="navbar contact__desktop-navbar">
                        <nav class="nav" aria-label="Contact section navigation">
                            <a class="nav__link" href="#home" aria-label="Sania Saju — Home">SANIA SAJU</a>
                            <a class="nav__link" href="#work">WORK</a>
                            <a class="nav__link" href="#pixels">PIXELS</a>
                            <a class="nav__link" href="#about">ABOUT</a>
                            <a class="nav__link" href="#contact">CONTACT</a>
                        </nav>
                    </div>



                    <!-- ==================================
                         CENTER CONTENT
                    =================================== -->

                    <div class="contact__content">

                        <h2
                            class="contact__title"
                            id="contact-title"
                        >
                            LET’S TALK.
                        </h2>


                        <p class="contact__text">

                            Have a project, opportunity, or quick note?

                            I’d love to hear from you.

                        </p>


                        <button
                            class="contact__open"
                            type="button"
                            aria-controls="contact-panel"
                            aria-expanded="false"
                        >

                            <span>
                                Open Contact Form
                            </span>


                            <portfolio-arrow
                                direction="right"
                            ></portfolio-arrow>

                        </button>

                    </div>


                    <!-- ==================================
                         CONTACT FOOTER
                    =================================== -->

                    <footer class="contact__footer">

                        <p>
                            ©2026
                        </p>


                        <!-- LINKEDIN -->

                        <a
                            class="contact__footer-link"
                            href="https://www.linkedin.com/in/sania-saju-50266322a"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            LINKEDIN
                        </a>


                        <!-- EMAIL COPY -->

                        <button
                            class="
                                contact__footer-link
                                contact__email-copy
                            "
                            type="button"
                            data-email="saniasaju.k@gmail.com"
                            aria-label="Copy email address"
                        >

                            <span>
                                EMAIL
                            </span>


                            <span
                                class="copy-feedback"
                                role="status"
                                aria-live="polite"
                            >
                                Email copied!
                            </span>

                        </button>


                        <!-- BEHANCE -->

                        <a
                            class="contact__footer-link"
                            href="https://www.behance.net/sania-saju"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            BEHANCE
                        </a>


                        <p>
                            THANK YOU!
                        </p>

                    </footer>

                </div>


                <!-- ======================================
                     CONTACT FORM PANEL
                ======================================= -->

                <aside
                    class="contact-panel"
                    id="contact-panel"
                    role="dialog"
                    aria-modal="true"
                    aria-hidden="true"
                    aria-labelledby="contact-panel-title"
                    inert
                >

                    <!-- ==============================
                         CLOSE BUTTON
                    =============================== -->

                    <button
                        class="contact-panel__close"
                        type="button"
                        aria-label="Close contact form"
                    >

                        <img
                            src="./assets/icons/close.svg"
                            alt=""
                            aria-hidden="true"
                        >

                    </button>


                    <!-- ==============================
                         PANEL INNER
                    =============================== -->

                    <div class="contact-panel__inner">

                        <h3
                            class="contact-panel__title"
                            id="contact-panel-title"
                        >
                            Contact Form
                        </h3>


                        <!-- ==========================
                             FORM
                        =========================== -->

                        <form
                            class="contact-form"
                            novalidate
                        >


                            <!-- ======================
                                 NAME
                            ======================= -->

                            <div class="contact-form__field">

                                <label
                                    class="contact-form__label"
                                    for="contact-name"
                                >
                                    Your Name*
                                </label>


                                <input
                                    id="contact-name"
                                    name="name"
                                    type="text"
                                    autocomplete="name"
                                    maxlength="60"
                                    aria-describedby="contact-name-count"
                                    required
                                >


                                <span
                                    class="contact-form__count"
                                    id="contact-name-count"
                                    aria-live="polite"
                                >
                                    0 / 60
                                </span>

                            </div>


                            <!-- ======================
                                 EMAIL
                            ======================= -->

                            <div class="contact-form__field">

                                <label
                                    class="contact-form__label"
                                    for="contact-email"
                                >
                                    Your Email*
                                </label>


                                <input
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    autocomplete="email"
                                    maxlength="120"
                                    required
                                >

                            </div>


                            <!-- ======================
                                 SUBJECT
                            ======================= -->

                            <div class="contact-form__field">

                                <label
                                    class="contact-form__label"
                                    for="contact-subject"
                                >
                                    What’s this about?
                                </label>


                                <input
                                    id="contact-subject"
                                    name="subject"
                                    type="text"
                                    maxlength="100"
                                    aria-describedby="contact-subject-count"
                                >


                                <span
                                    class="contact-form__count"
                                    id="contact-subject-count"
                                    aria-live="polite"
                                >
                                    0 / 100
                                </span>

                            </div>


                            <!-- ======================
                                 MESSAGE
                            ======================= -->

                            <div
                                class="
                                    contact-form__field
                                    contact-form__field--message
                                "
                            >

                                <label
                                    class="contact-form__label"
                                    for="contact-message"
                                >
                                    Message*
                                </label>


                                <textarea
                                    id="contact-message"
                                    class="contact-form__message"
                                    name="message"
                                    maxlength="5000"
                                    data-lenis-prevent
                                    required
                                ></textarea>

                            </div>


                            <!-- ======================
                                 SEND
                            ======================= -->

                            <button
                                class="contact-form__submit"
                                type="submit"
                            >

                                <span
                                    class="contact-form__submit-label"
                                    role="status"
                                    aria-live="polite"
                                >
                                    Send
                                </span>


                                <portfolio-arrow
                                    direction="right"
                                ></portfolio-arrow>

                            </button>


                            <!-- ======================
                                 SPAM HONEYPOT
                            ======================= -->

                            <div
                                class="contact-form__honeypot"
                                aria-hidden="true"
                            >

                                <label for="contact-website">
                                    Website
                                </label>


                                <input
                                    id="contact-website"
                                    name="website"
                                    type="text"
                                    tabindex="-1"
                                    autocomplete="off"
                                >

                            </div>

                        </form>

                    </div>

                </aside>

            </section>

        `;

    }


    /* ========================================================
       DISCONNECT

       Clean up listeners, animation frames and timers.
    ======================================================== */

    disconnectedCallback() {
        this._submitController?.abort();


        /* ====================================================
           REMOVE EVENT LISTENERS
        ==================================================== */

        this._cleanupFunctions?.forEach(
            cleanup => {

                cleanup();

            }
        );


        this._cleanupFunctions = [];


        /* ====================================================
           CANCEL NAVBAR ANIMATION FRAME
        ==================================================== */

        if (this._navbarRafId !== null) {

            window.cancelAnimationFrame(
                this._navbarRafId
            );

            this._navbarRafId = null;

        }


        /* ====================================================
           CLEAR TIMERS
        ==================================================== */

        [
            "_copyFeedbackTimer",
            "_panelFocusTimer",
            "_panelInertTimer",
            "_restoreFocusTimer",
            "_submitResetTimer"
        ].forEach(timerName => {

            window.clearTimeout(
                this[timerName]
            );


            this[timerName] = null;

        });


        /* ====================================================
           RESET HANDLERS
        ==================================================== */

        this.handleEscape = null;

        this.handleNavbarReveal = null;


        /* ====================================================
           RESET INITIALIZATION STATE
        ==================================================== */

        this.dataset.initialized = "false";

    }

}


/* ============================================================
   REGISTER COMPONENT
============================================================ */

if (!customElements.get("contact-section")) {

    customElements.define(
        "contact-section",
        ContactSection
    );

}
