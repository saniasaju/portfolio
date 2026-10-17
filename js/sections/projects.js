/* ============================================================
   SANIA SAJU — PORTFOLIO
   SELECTED PROJECTS COMPONENT
============================================================ */

class ProjectsSection extends HTMLElement {

    connectedCallback() {

        /* ======================================================
           PROJECT DATA
        ====================================================== */

        const projects = [

            /* ==================================================
               01. PORTFOLIO
            ================================================== */

            {
                number: "01",

                title: "Portfolio | Website",

                type: "Web Design + Development",

                description:
                    "A personal portfolio designed to communicate who I am as a designer and developer, and how I approach designing and building digital products.",

                tags: [
                    "#personal branding",
                    "#web design",
                    "#UI/UX strategy"
                ],

                caseStudyLink: "./pages/portfolio.html",

                mediaLink: "#home",

                mediaLabel:
                    "View Portfolio Website",

                mediaType:
                    "laptop-video",

                reverse:
                    false,

                mockup:
                    "./assets/images/mockups/laptop.svg",

                video:
                    "./assets/videos/portfolio.webm"
            },



            /* ==================================================
               02. CAMPINN
            ================================================== */

            {
                number: "02",

                title: "CampInn | Mobile App",

                type: "UI/UX Design",

                description:
                    "CampInn is a mobile e-commerce app that helps beginner and budget-conscious campers discover, understand, and purchase camping gear with less effort.",

                tags: [
                    "#UX research",
                    "#interaction design",
                    "#accessibility",
                    "#product design"
                ],

                caseStudyLink: "./pages/campinn.html",

                mediaLink: "https://www.figma.com/proto/VM7V1xW0wPRbogJqQdxUgA/CampInn?node-id=365-801&p=f&t=zGcuOza1cbdZY2n2-1&scaling=scale-down&content-scaling=fixed&page-id=208%3A422&starting-point-node-id=365%3A801",

                mediaLabel:
                    "View CampInn prototype",

                mediaType:
                    "mobile-video",

                reverse:
                    true,

                mockup:
                    "./assets/images/mockups/mobile.svg",

                video:
                    "./assets/videos/campinn.webm"
            },


            /* ==================================================
               03. ALPHONSIANS' GYM
            ================================================== */

            {
                number: "03",

                title:
                    "Alphonsians’ Gym | Website",

                type:
                    "Web Design + Development",

                description:
                    "Alphonsians’ Gym is a responsive website for the gym at Alphonsa College, Pala, designed to support students’ fitness and wellness needs.",

                tags: [
                    "#web design",
                    "#UI/UX",
                    "#responsive design",
                    "#front-end development"
                ],

                caseStudyLink: "./pages/alphonsiansgym.html",

                mediaLink:
                    "https://saniasaju.github.io/alphonsians-gym/",

                mediaLabel:
                    "View the live Alphonsians' Gym website",

                mediaType:
                    "laptop-video",

                reverse:
                    false,

                mockup:
                    "./assets/images/mockups/laptop.svg",

                video:
                    "./assets/videos/gym-v2.webm"
            }

        ];



        /* ======================================================
           RENDER MEDIA
        ====================================================== */

        const renderMedia = project => {

            /* ==================================================
               CAMPINN — MOBILE VIDEO
            ================================================== */

            if (
                project.mediaType ===
                "mobile-video"
            ) {

                return `

                    <a
                        class="
                            project__media-link
                            project__media-link--mobile
                        "
                        href="${project.mediaLink}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="${project.mediaLabel}"
                    >

                        <div class="mobile-mockup">


                            <!-- ================================
                                 MOBILE SCREEN
                            ================================= -->

                            <div
                                class="mobile-mockup__screen"
                                aria-hidden="true"
                            >

                                <video
                                    class="
                                        mobile-mockup__video
                                        project__video
                                    "
                                    muted
                                    loop
                                    playsinline
                                    preload="metadata"
                                >

                                    <source
                                        src="${project.video}"
                                        type="video/webm"
                                    >

                                </video>

                            </div>



                            <!-- ================================
                                 MOBILE FRAME
                            ================================= -->

                            <img
                                class="mobile-mockup__frame"
                                src="${project.mockup}"
                                alt=""
                                aria-hidden="true"
                            >


                        </div>

                    </a>

                `;

            }



            /* ==================================================
               ALPHONSIANS' GYM — LAPTOP VIDEO
            ================================================== */

            if (
                project.mediaType ===
                "laptop-video" ||
                project.mediaType === "laptop-image"
            ) {

                return `

                    <a
                        class="
                            project__media-link
                            project__media-link--laptop
                        "
                        href="${project.mediaLink}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="${project.mediaLabel}"
                    >

                        <div class="laptop-mockup">


                            <!-- ================================
                                 LAPTOP FRAME
                            ================================= -->

                            <img
                                class="laptop-mockup__frame"
                                src="${project.mockup}"
                                alt=""
                                aria-hidden="true"
                            >



                            <!-- ================================
                                 LAPTOP SCREEN
                            ================================= -->

                            <div
                                class="laptop-mockup__screen"
                                aria-hidden="true"
                            >

                                ${project.mediaType === "laptop-image" ? `
                                    <img
                                        class="laptop-mockup__image"
                                        src="${project.image}"
                                        alt=""
                                        loading="lazy"
                                    >
                                ` : `
                                <video
                                    class="
                                        laptop-mockup__video
                                        project__video
                                    "
                                    muted
                                    loop
                                    playsinline
                                    preload="metadata"
                                >

                                    <source
                                        src="${project.video}"
                                        type="video/webm"
                                    >

                                </video>
                                `}

                            </div>


                        </div>

                    </a>

                `;

            }



            /* ==================================================
               DEFAULT PLACEHOLDER
            ================================================== */

            return `

                <a
                    class="project__media-link"
                    href="${project.mediaLink}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="${project.mediaLabel}"
                >

                    <div
                        class="project__media-placeholder"
                        aria-hidden="true"
                    ></div>

                </a>

            `;

        };



        /* ======================================================
           RENDER PROJECT
        ====================================================== */

        const renderProject = project => {

            const tags =
                project.tags
                    .map(
                        tag => `
                            <span>
                                ${tag}
                            </span>
                        `
                    )
                    .join("");


            const reverseClass =
                project.reverse
                    ? "project--reverse"
                    : "";


            return `

                <article
                    class="
                        project
                        ${reverseClass}
                    "
                >


                    <!-- ========================================
                         PROJECT CONTENT
                    ========================================= -->

                    <div class="project__content">


                        <h3 class="project__title">

                            ${project.title}

                        </h3>


                        <p class="project__type">

                            ${project.type}

                        </p>


                        <p class="project__description">

                            ${project.description}

                        </p>


                        <div
                            class="project__tags"
                            aria-label="Project tags"
                        >

                            ${tags}

                        </div>


                        <a
                            class="project__cta"
                            href="${project.caseStudyLink}"
                        >

                            <span>
                                View Case Study
                            </span>


                            <portfolio-arrow
                                direction="right"
                            ></portfolio-arrow>

                        </a>


                    </div>



                    <!-- ========================================
                         PROJECT VISUAL
                    ========================================= -->

                    <div class="project__visual">

                        <div
                            class="project__rectangle"
                            aria-hidden="true"
                        ></div>

                        <span
                            class="project__number"
                            aria-hidden="true"
                        >
                            ${project.number}
                        </span>

                        ${renderMedia(project)}

                    </div>


                </article>

            `;

        };



        /* ======================================================
           BUILD PROJECTS
        ====================================================== */

        const projectsMarkup =
            projects
                .map(renderProject)
                .join("");



        /* ======================================================
           COMPONENT
        ====================================================== */

        this.innerHTML = `

            <section
                class="projects"
                aria-label="Selected projects"
            >

                <div
                    class="projects__inner"
                    id="work"
                >

                    ${projectsMarkup}

                </div>

            </section>

        `;



        /* ======================================================
           PROJECT ENTRANCE MOTION
        ====================================================== */

        this.setupProjectReveal();

    }



    /* ==========================================================
       ONE-TIME PROJECT REVEAL
    ========================================================== */

    setupProjectReveal() {

        const projects =
            Array.from(
                this.querySelectorAll(
                    ".project"
                )
            );


        const reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );



        /* ======================================================
           REDUCED MOTION

           Show everything immediately.
        ====================================================== */

        if (
            reducedMotion.matches ||
            document.documentElement.classList.contains("home-is-revealed")
        ) {

            projects.forEach(project => {

                project.classList.add(
                    "is-visible",
                    "is-revealed"
                );


                const video =
                    project.querySelector(
                        ".project__video"
                    );


                if (video) {

                    video
                        .play()
                        .catch(() => {});

                }

            });


            return;

        }



        /* ======================================================
           INTERSECTION OBSERVER
        ====================================================== */

        this.projectObserver =
            new IntersectionObserver(

                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) {
                            return;
                        }


                        const project =
                            entry.target;



                        /* ======================================
                           ALREADY REVEALED

                           Never replay the entrance.
                        ====================================== */

                        if (
                            project.classList.contains(
                                "is-revealed"
                            )
                        ) {

                            this.projectObserver.unobserve(
                                project
                            );

                            return;

                        }



                        const rectangle =
                            project.querySelector(
                                ".project__rectangle"
                            );


                        const video =
                            project.querySelector(
                                ".project__video"
                            );


                        if (!rectangle) {

                            this.projectObserver.unobserve(
                                project
                            );

                            return;

                        }



                        /* ======================================
                           START ENTRANCE
                        ====================================== */

                        project.classList.add(
                            "is-visible"
                        );



                        /* ======================================
                           WAIT FOR VISUAL TO SETTLE
                        ====================================== */

                        const handleTransitionEnd =
                            event => {

                                if (
                                    event.target !== rectangle
                                ) {
                                    return;
                                }


                                if (
                                    event.propertyName !==
                                    "transform"
                                ) {
                                    return;
                                }



                                /* ==============================
                                   FINAL PERMANENT STATE
                                ============================== */

                                project.classList.add(
                                    "is-revealed"
                                );



                                /* ==============================
                                   START VIDEO

                                   Starts only when the mockup
                                   reaches its final position.
                                ============================== */

                                if (video) {

                                    video.currentTime = 0;


                                    video
                                        .play()
                                        .catch(() => {});

                                }



                                /* ==============================
                                   CLEANUP
                                ============================== */

                                rectangle.removeEventListener(
                                    "transitionend",
                                    handleTransitionEnd
                                );


                                this.projectObserver.unobserve(
                                    project
                                );

                            };


                        rectangle.addEventListener(
                            "transitionend",
                            handleTransitionEnd
                        );

                    });

                },

                {
                    threshold: 0.3
                }

            );



        /* ======================================================
           OBSERVE PROJECTS
        ====================================================== */

        projects.forEach(project => {

            this.projectObserver.observe(
                project
            );

        });

    }



    /* ==========================================================
       CLEANUP
    ========================================================== */

    disconnectedCallback() {

        if (this.projectObserver) {

            this.projectObserver.disconnect();

        }

    }

}



/* ============================================================
   REGISTER
============================================================ */

customElements.define(
    "projects-section",
    ProjectsSection
);
