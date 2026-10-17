/* ============================================================
   SANIA SAJU — PORTFOLIO
   PORTFOLIO NAVBAR COMPONENT

   Supports:
   - Homepage navigation
   - Case-study page navigation
   - Solid / transparent variants through CSS
============================================================ */


class PortfolioNavbar extends HTMLElement {


    /* ========================================================
       CONNECT
    ======================================================== */

    connectedCallback() {

        if (
            this.dataset.initialized ===
            "true"
        ) {
            return;
        }


        this.dataset.initialized =
            "true";


        this.render();

    }



    /* ========================================================
       GET LINKS

       Homepage:
       #home
       #work
       #pixels
       #about
       #contact

       Case-study pages:
       ../home.html#home
       ../home.html#work
       etc.
    ======================================================== */

    getNavigationLinks() {

        /*
           All case-study pages currently live
           inside /pages/.

           body.portfolio-page also gives us
           an explicit page-level check.
        */

        const isCaseStudyPage =
            document.body.classList.contains(
                "portfolio-page"
            ) ||
            window.location.pathname.includes(
                "/pages/"
            );


        const homePrefix =
            isCaseStudyPage
                ? "../home.html"
                : "";


        return {

            home:
                `${homePrefix}#home`,

            work:
                `${homePrefix}#work`,

            pixels:
                `${homePrefix}#pixels`,

            about:
                `${homePrefix}#about`,

            contact:
                `${homePrefix}#contact`

        };

    }



    /* ========================================================
       RENDER
    ======================================================== */

    render() {

        const links =
            this.getNavigationLinks();


        this.innerHTML = `

            <header class="portfolio-navbar">

                <nav
                    class="nav"
                    aria-label="Primary navigation"
                >

                    <div class="nav__links">


                        <!-- ==================================
                             HOME
                        =================================== -->

                        <a
                            class="nav__link"
                            href="${links.home}"
                            aria-label="Sania Saju — Home"
                        >
                            SANIA SAJU
                        </a>


                        <!-- ==================================
                             PROJECTS
                        =================================== -->

                        <a
                            class="nav__link"
                            href="${links.work}"
                        >
                            Projects
                        </a>


                        <!-- ==================================
                             PIXELS
                        =================================== -->

                        <a
                            class="nav__link"
                            href="${links.pixels}"
                        >
                            Pixels
                        </a>


                        <!-- ==================================
                             ABOUT
                        =================================== -->

                        <a
                            class="nav__link"
                            href="${links.about}"
                        >
                            About
                        </a>


                        <!-- ==================================
                             CONTACT
                        =================================== -->

                        <a
                            class="nav__link"
                            href="${links.contact}"
                        >
                            Contact
                        </a>


                    </div>

                </nav>

            </header>

        `;

    }

}



/* ============================================================
   REGISTER COMPONENT
============================================================ */

if (
    !customElements.get(
        "portfolio-navbar"
    )
) {

    customElements.define(
        "portfolio-navbar",
        PortfolioNavbar
    );

}

/* Mobile menus live in the top layer, outside the animated section wrappers. */
document.addEventListener("DOMContentLoaded", () => {
    const mobile = window.matchMedia("(orientation: portrait), (min-width: 768px) and (max-width: 1280px)");
    const sidebar = document.querySelector(
        ".campinn-study__sidebar, .portfolio-study__sidebar, .gym-study__sidebar"
    );
    const primaryLinks = document.querySelector("portfolio-navbar .nav__links");
    if (!primaryLinks) return;

    const dialogs = [];
    const pageLenis = () => window.portfolioLenis || window.campinnLenis || window.gymLenis;
    const closingMenus = new WeakMap();
    let menuRequest = 0;
    let switchingMenus = false;
    const slideBetweenMenus = async (from, to) => {
        switchingMenus = true;
        const direction = to.id === "mobile-navigation-menu" ? 1 : -1;
        const slidingList = dialog => dialog.querySelector(
            ".nav__links, .portfolio-study__sidebar-group, .campinn-study__sidebar-group, .gym-study__sidebar-top"
        );
        const outgoing = slidingList(from);
        const incoming = slidingList(to);
        const exit = outgoing.animate(
            [{ transform: "translateX(0)", opacity: 1 }, { transform: `translateX(${-direction * 100}%)`, opacity: 0 }],
            { duration: 250, easing: "ease-in", fill: "forwards" }
        );
        try {
            await exit.finished;
            to.style.animation = "none";
            to.show();
            from.close();
            const enter = incoming.animate(
                [{ transform: `translateX(${direction * 100}%)`, opacity: 0 }, { transform: "translateX(0)", opacity: 1 }],
                { duration: 250, easing: "ease-out" }
            );
            await enter.finished;
        } finally {
            exit.cancel();
            switchingMenus = false;
        }
    };
    const closeMenu = (dialog) => {
        if (closingMenus.has(dialog)) return closingMenus.get(dialog);
        if (!dialog.open) return Promise.resolve();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !mobile.matches) {
            dialog.close();
            return Promise.resolve();
        }
        const start = getComputedStyle(dialog).clipPath;
        dialog.style.animation = "none";
        dialog.classList.add("is-closing");
        const motion = dialog.animate(
            [{ clipPath: start }, { clipPath: "inset(0 0 100% 0)" }],
            { duration: 600, easing: "cubic-bezier(.64, 0, .78, 0)", fill: "forwards" }
        );
        const finished = motion.finished.catch(() => {}).then(() => {
            dialog.close();
            motion.cancel();
            dialog.style.animation = "";
            dialog.classList.remove("is-closing");
            closingMenus.delete(dialog);
        });
        closingMenus.set(dialog, finished);
        return finished;
    };
    const makeMenu = (name, label, source) => {
        const dialog = document.createElement("dialog");
        dialog.id = `mobile-${name}-menu`;
        dialog.className = "mobile-menu";
        dialog.setAttribute("aria-label", label);
        dialog.setAttribute("data-lenis-prevent", "");
        const content = document.createElement("div");
        content.className = "mobile-menu__content";
        content.append(source.cloneNode(true));
        content.querySelectorAll('a[class*="-study__toc-link"]').forEach(link => {
            [...link.classList].filter(name => name.endsWith("-study__toc-link")).forEach(name => link.classList.remove(name));
            link.classList.add("mobile-menu__toc-link");
        });
        // Menu copies must not duplicate document IDs.
        content.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
        if (name === "navigation") {
            const links = content.querySelectorAll(".nav__link");
            links[0]?.remove();
            if (links[1]) links[1].textContent = "WORK";
            links.forEach(link => { link.textContent = link.textContent.trim().toUpperCase(); });
            const cases = document.createElement("nav");
            cases.className = "mobile-menu__cases";
            cases.setAttribute("aria-label", "Case studies");
            const prefix = sidebar ? "./" : "./pages/";
            cases.innerHTML = `<p class="mobile-menu__label">CASE STUDIES</p>
                <a href="${prefix}portfolio.html">Portfolio</a>
                <a href="${prefix}campinn.html">CampInn</a>
                <a href="${prefix}alphonsiansgym.html">Alphonsians’ Gym</a>`;
            if (sidebar) {
                const current = document.body.className;
                const index = current.includes("campinn-page") ? 1 : current.includes("gym-page") ? 2 : 0;
                cases.querySelectorAll("a")[index].setAttribute("aria-current", "page");
            }
            content.append(cases);
        }
        dialog.append(content);
        document.body.append(dialog);
        dialog.addEventListener("click", async event => {
            if (event.target === dialog) {
                const rect = dialog.getBoundingClientRect();
                if (event.clientX < rect.left || event.clientX > rect.right) closeMenu(dialog);
            }
            const link = event.target.closest("a[href]");
            if (!link) return;
            const href = link.getAttribute("href");
            event.preventDefault();
            await closeMenu(dialog);
            if (href.startsWith("#")) {
                event.preventDefault();
                const original = [...source.querySelectorAll("a")].find(a => a.getAttribute("href") === href);
                requestAnimationFrame(() => {
                    pageLenis()?.start();
                    original?.click();
                });
            } else {
                window.location.assign(link.href);
            }
        });
        dialog.addEventListener("close", () => {
            document.querySelectorAll(`[aria-controls="${dialog.id}"]`).forEach(button => button.setAttribute("aria-expanded", "false"));
            if (!dialogs.some(menu => menu.open)) {
                document.documentElement.classList.remove("mobile-menu-open");
                pageLenis()?.start();
            }
        });
        dialogs.push(dialog);
        return dialog;
    };
    const navigation = makeMenu("navigation", "Site navigation", primaryLinks);
    const contents = sidebar ? makeMenu("contents", "Case study contents", sidebar) : null;
    const buttonFor = (dialog, isContents) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `mobile-menu-toggle${isContents ? " mobile-menu-toggle--contents" : ""}`;
        button.setAttribute("aria-label", isContents ? "Open case study contents" : "Open navigation menu");
        button.setAttribute("aria-controls", dialog.id);
        button.setAttribute("aria-expanded", "false");
        button.innerHTML = '<span></span><span></span><span></span>';
        button.addEventListener("click", async () => {
            if (switchingMenus) return;
            const request = ++menuRequest;
            if (dialog.open) {
                closeMenu(dialog);
                return;
            }
            if (isContents) {
                const originalLinks = [...sidebar.querySelectorAll("a")];
                dialog.querySelectorAll("a").forEach((link, index) => {
                    const original = originalLinks[index];
                    link.classList.toggle("is-active", original?.classList.contains("is-active"));
                    const current = original?.getAttribute("aria-current");
                    if (current) link.setAttribute("aria-current", current);
                    else link.removeAttribute("aria-current");
                });
            }
            button.setAttribute("aria-expanded", "true");
            const other = dialogs.find(menu => menu !== dialog && menu.open);
            if (other && !closingMenus.has(other) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                await slideBetweenMenus(other, dialog);
                button.focus({ preventScroll: true });
                return;
            }
            await Promise.all(dialogs.filter(menu => menu.open).map(closeMenu));
            if (request !== menuRequest) return;
            const pagePosition = { left: window.scrollX, top: window.scrollY };
            // Cancel outstanding smooth-scroll momentum at the visible position.
            pageLenis()?.scrollTo(pagePosition.top, { immediate: true, force: true });
            document.documentElement.classList.add("mobile-menu-open");
            pageLenis()?.stop();
            dialog.show();
            button.focus({ preventScroll: true });
            if (window.scrollY !== pagePosition.top || window.scrollX !== pagePosition.left) {
                window.scrollTo({ ...pagePosition, behavior: "instant" });
            }
        });
        return button;
    };
    document.querySelectorAll("portfolio-navbar .nav__links, .contact .navbar .nav").forEach(nav => {
        const controls = document.createElement("div");
        controls.className = "mobile-nav-controls";
        if (contents) controls.append(buttonFor(contents, true));
        controls.append(buttonFor(navigation, false));
        nav.append(controls);
    });
    mobile.addEventListener("change", () => {
        if (!mobile.matches) dialogs.forEach(dialog => { if (dialog.open) dialog.close(); });
    });

    // Non-modal panels let the real fixed navbar stay above the overlay.
    // Keep keyboard navigation within the open panel and its navbar controls.
    document.addEventListener("keydown", event => {
        const panel = dialogs.find(menu => menu.open);
        if (!panel) return;
        if (switchingMenus && (event.key === "Escape" || event.key === "Tab")) {
            event.preventDefault();
            return;
        }
        if (event.key === "Escape") {
            event.preventDefault();
            closeMenu(panel);
            document.querySelector(`.mobile-fixed-navbar [aria-controls="${panel.id}"]`)?.focus({ preventScroll: true });
        }
        if (event.key === "Tab") {
            const items = [...document.querySelectorAll(".mobile-fixed-navbar a, .mobile-fixed-navbar button"), ...panel.querySelectorAll("a, button")].filter(el => el.getClientRects().length);
            const index = items.indexOf(document.activeElement);
            event.preventDefault();
            items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length]?.focus({ preventScroll: true });
        }
    });
    document.addEventListener("click", event => {
        if (event.target.closest(".mobile-fixed-navbar, .mobile-menu")) return;
        dialogs.forEach(menu => { if (menu.open) closeMenu(menu); });
    });

    // Keep the mobile header outside the stacked sections so it stays above
    // every page section, without changing the desktop header placement.
    const header = document.querySelector("portfolio-navbar");
    const headerSpace = document.createElement("div");
    headerSpace.className = "mobile-navbar-space";
    header.after(headerSpace);
    const headerBackground = document.createElement("div");
    headerBackground.className = "mobile-navbar-background";
    headerBackground.setAttribute("aria-hidden", "true");
    document.body.append(headerBackground);
    const positionHeader = () => {
        if (mobile.matches) {
            header.classList.add("mobile-fixed-navbar");
            document.body.append(header);
            headerSpace.style.height = `${header.getBoundingClientRect().height}px`;
            headerBackground.style.height = headerSpace.style.height;
            document.documentElement.style.setProperty("--mobile-navbar-height", headerSpace.style.height);
        } else {
            header.classList.remove("mobile-fixed-navbar");
            headerSpace.before(header);
            headerSpace.style.height = "";
        }
    };
    positionHeader();
    mobile.addEventListener("change", positionHeader);
    const headerObserver = new ResizeObserver(() => {
        if (mobile.matches) {
            headerSpace.style.height = `${header.getBoundingClientRect().height}px`;
            headerBackground.style.height = headerSpace.style.height;
            document.documentElement.style.setProperty("--mobile-navbar-height", headerSpace.style.height);
        }
    });
    headerObserver.observe(header);
    const aboutSection = document.querySelector("about-section");
    const aboutContent = aboutSection?.querySelector(".about");
    if (aboutContent) {
        // The pinned Pixels track must end before Contact reaches the page end.
        // Cap the overlap at About's real height, including the mobile type scale.
        const updateAboutOverlap = () => {
            if (mobile.matches) {
                aboutSection.style.setProperty("--about-overlap", `${Math.min(window.innerHeight * 2.5, aboutContent.getBoundingClientRect().height)}px`);
            } else {
                aboutSection.style.removeProperty("--about-overlap");
            }
        };
        const aboutObserver = new ResizeObserver(updateAboutOverlap);
        aboutObserver.observe(aboutContent);
        window.addEventListener("resize", updateAboutOverlap);
        updateAboutOverlap();
    }
    // Mobile typography uses the existing D artwork with a cropped viewBox.
    const heroContent = document.querySelector(".hero__content");
    if (heroContent) {
        const composition = document.createElement("div");
        composition.className = "hero-mobile";
        composition.setAttribute("role", "img");
        composition.setAttribute("aria-label", "Designer Developer. UI/UX and Front-End. Kerala, India.");
        composition.innerHTML = `
            <span class="hero-mobile__designer">ESIGNER</span>
            <img class="hero-mobile__core" src="./assets/images/d-mobile.svg" alt="">
            <span class="hero-mobile__developer">EVELOPER</span>
            <div class="hero-mobile__metadata">UI/UX + Front-End<br>Kerala, India<br>PORTFOLIO / 2026</div>
            <div class="hero-mobile__purpose">Guided by purpose<br>Shaped by empathy<br>Refined with intention</div>`;
        heroContent.append(composition);
    }
    // Reuse the existing social buttons and their email-copy listeners.
    const socials = document.querySelector(".hero__socials");
    const heroFooter = document.querySelector(".hero__footer");
    const placeSocials = () => {
        if (!socials || !heroContent || !heroFooter) return;
        if (mobile.matches) heroContent.querySelector(".hero-mobile__metadata")?.append(socials);
        else heroFooter.prepend(socials);
    };
    placeSocials();
    mobile.addEventListener("change", placeSocials);

    // The reference places icon links beneath the contact heading.
    const contactContent = document.querySelector(".contact__content");
    if (contactContent && socials) {
        const contactSocials = socials.cloneNode(true);
        contactSocials.className = "contact__socials";
        contactSocials.setAttribute("aria-label", "Social links");
        contactSocials.querySelectorAll(".copy-feedback").forEach(el => el.remove());
        const email = contactSocials.querySelector("button");
        if (email) {
            const emailLink = document.createElement("a");
            emailLink.className = "social-link";
            emailLink.href = "mailto:saniasaju.k@gmail.com";
            emailLink.setAttribute("aria-label", "Email Sania");
            emailLink.append(...email.childNodes);
            email.replaceWith(emailLink);
        }
        document.querySelector(".contact__title").after(contactSocials);
    }
});

// Fit portrait case-study compositions inside their fixed viewport section.
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.portfolio-hero, .campinn-hero, .gym-hero');
    const content = hero?.querySelector('.portfolio-hero__content, .campinn-hero__content, .gym-hero__content');
    if (!hero || !content) return;
    let frame = 0;
    const fit = () => {
        frame = 0;
        if (!matchMedia('(orientation: portrait), (min-width: 768px) and (max-width: 1280px)').matches) {
            content.style.removeProperty('--hero-content-fit');
            return;
        }
        const style = getComputedStyle(hero);
        const available = hero.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
        const natural = content.offsetHeight;
        content.style.setProperty('--hero-content-fit', Math.min(1, available / Math.max(1, natural)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(fit); };
    const observer = new ResizeObserver(schedule);
    observer.observe(hero);
    observer.observe(content);
    window.addEventListener('resize', schedule);
    document.fonts.ready.then(schedule);
    schedule();
});

document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('.contact__main');
    const content = document.querySelector('.contact__content');
    if (!main || !content) return;
    let frame = 0;
    const fit = () => {
        frame = 0;
        const style = getComputedStyle(main);
        const footer = main.querySelector('.contact__footer');
        const available = main.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - (footer?.offsetHeight || 0) - 24;
        content.style.setProperty('--contact-content-fit', Math.min(1, Math.max(0.1, available / Math.max(1, content.offsetHeight))));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(fit); };
    const observer = new ResizeObserver(schedule);
    observer.observe(main);
    observer.observe(content);
    window.addEventListener('resize', schedule);
    document.fonts.ready.then(schedule);
    schedule();
});
