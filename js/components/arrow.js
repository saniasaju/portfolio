/* ============================================================
   PORTFOLIO ARROW COMPONENT

   Works from:
   - index.html
   - pages/portfolio.html
   - pages/campinn.html
   - pages/alphonsiansgym.html

   Arrow assets are resolved relative to this component file,
   rather than relative to the HTML page.
============================================================ */


/* ============================================================
   ASSET PATH
============================================================ */

/*
   arrow.js lives here:

   /js/components/arrow.js

   Arrow SVGs live here:

   /assets/icons/arrow-1.svg
   /assets/icons/arrow-2.svg
   /assets/icons/arrow-3.svg

   Resolving the assets from the script URL means the component
   works correctly even when the HTML page is inside /pages/.
*/

const portfolioArrowScriptURL =
    document.currentScript?.src;


const portfolioArrowAssetBase =
    portfolioArrowScriptURL
        ? new URL(
            "../../assets/icons/",
            portfolioArrowScriptURL
        )
        : null;



/* ============================================================
   GET ARROW ASSET
============================================================ */

const getPortfolioArrowAsset =
    filename => {


        /*
           Normal case:
           resolve relative to arrow.js.
        */

        if (portfolioArrowAssetBase) {

            return new URL(
                filename,
                portfolioArrowAssetBase
            ).href;

        }


        /*
           Fallback for unusual environments where
           document.currentScript is unavailable.
        */

        return `/assets/icons/${filename}`;

    };



/* ============================================================
   PORTFOLIO ARROW
============================================================ */

class PortfolioArrow extends HTMLElement {


    /* ========================================================
       CONNECT
    ======================================================== */

    connectedCallback() {


        /*
           Prevent duplicate setup if the element is
           disconnected and reconnected.
        */

        if (
            this.dataset.initialized ===
            "true"
        ) {
            return;
        }


        this.dataset.initialized =
            "true";



        /* ====================================================
           SETTINGS
        ==================================================== */

        this.currentFrame =
            1;


        this.targetFrame =
            1;


        this.animationTimer =
            null;



        /* ====================================================
           DIRECTION
        ==================================================== */

        const direction =
            this.getAttribute(
                "direction"
            ) || "right";


        const supportedDirections = [
            "right",
            "down",
            "left",
            "up"
        ];


        const safeDirection =
            supportedDirections.includes(
                direction
            )
                ? direction
                : "right";


        this.classList.add(
            "portfolio-arrow",
            `portfolio-arrow--${safeDirection}`
        );



        /* ====================================================
           DEFAULT FRAME
        ==================================================== */

        this.dataset.frame =
            "1";


        this.dataset.motion =
            "idle";



        /* ====================================================
           ACCESSIBILITY

           Arrow is decorative.

           The surrounding link or button supplies the
           accessible label.
        ==================================================== */

        this.setAttribute(
            "aria-hidden",
            "true"
        );



        /* ====================================================
           MARKUP

           SVG dimensions remain native.

           CSS controls positioning/orientation.
        ==================================================== */

        this.innerHTML = `

            <img
                class="portfolio-arrow__frame--1"
                src="${getPortfolioArrowAsset(
                    "arrow-1.svg"
                )}"
                alt=""
                aria-hidden="true"
            >

            <img
                class="portfolio-arrow__frame--2"
                src="${getPortfolioArrowAsset(
                    "arrow-2.svg"
                )}"
                alt=""
                aria-hidden="true"
            >

            <img
                class="portfolio-arrow__frame--3"
                src="${getPortfolioArrowAsset(
                    "arrow-3.svg"
                )}"
                alt=""
                aria-hidden="true"
            >

        `;



        /* ====================================================
           TRIGGER

           The nearest link or button controls the arrow.

           Therefore hovering/focusing either the text or the
           arrow activates the complete CTA interaction.
        ==================================================== */

        this.trigger =
            this.closest(
                "a, button"
            );


        if (!this.trigger) {
            return;
        }



        /* ====================================================
           EVENT HANDLERS
        ==================================================== */

        this.activate =
            () => {

                this.animateTo(
                    3
                );

            };


        this.deactivate =
            () => {

                this.animateTo(
                    1
                );

            };



        /* ====================================================
           EVENTS
        ==================================================== */

        this.trigger.addEventListener(
            "mouseenter",
            this.activate
        );


        this.trigger.addEventListener(
            "mouseleave",
            this.deactivate
        );


        this.trigger.addEventListener(
            "focusin",
            this.activate
        );


        this.trigger.addEventListener(
            "focusout",
            this.deactivate
        );

    }



    /* ========================================================
       SET FRAME
    ======================================================== */

    setFrame(
        frame
    ) {

        this.currentFrame =
            frame;


        this.dataset.frame =
            String(
                frame
            );

    }



    /* ========================================================
       ANIMATE TO FRAME

       Hover / focus:
       1 → 2 → 3

       Mouse leave / focus out:
       3 → 2 → 1
    ======================================================== */

    animateTo(
        targetFrame
    ) {


        this.targetFrame =
            targetFrame;



        /* ====================================================
           CANCEL PREVIOUS STEP
        ==================================================== */

        clearTimeout(
            this.animationTimer
        );



        /* ====================================================
           ALREADY AT TARGET
        ==================================================== */

        if (
            this.currentFrame ===
            this.targetFrame
        ) {

            this.dataset.motion =
                "idle";


            return;

        }



        /* ====================================================
           DIRECTION
        ==================================================== */

        const growing =
            this.targetFrame >
            this.currentFrame;


        this.dataset.motion =
            growing
                ? "growing"
                : "shrinking";


        const direction =
            growing
                ? 1
                : -1;


        const nextFrame =
            this.currentFrame +
            direction;



        /* ====================================================
           CHANGE FRAME
        ==================================================== */

        this.setFrame(
            nextFrame
        );



        /* ====================================================
           FRAME DELAY

           Growing:
           1 → 2 = 12ms
           2 → 3 = 6ms

           Shrinking:
           3 → 2 = 6ms
           2 → 1 = 12ms

           This preserves the timing from your current
           component.
        ==================================================== */

        let delay;


        if (growing) {

            delay =
                nextFrame === 2
                    ? 12
                    : 6;

        }

        else {

            delay =
                nextFrame === 2
                    ? 6
                    : 12;

        }



        /* ====================================================
           CONTINUE
        ==================================================== */

        if (
            this.currentFrame !==
            this.targetFrame
        ) {

            this.animationTimer =
                window.setTimeout(
                    () => {

                        this.animateTo(
                            this.targetFrame
                        );

                    },
                    delay
                );

        }

        else {

            this.dataset.motion =
                "idle";

        }

    }



    /* ========================================================
       CLEANUP
    ======================================================== */

    disconnectedCallback() {


        clearTimeout(
            this.animationTimer
        );


        this.animationTimer =
            null;


        if (this.trigger) {


            this.trigger.removeEventListener(
                "mouseenter",
                this.activate
            );


            this.trigger.removeEventListener(
                "mouseleave",
                this.deactivate
            );


            this.trigger.removeEventListener(
                "focusin",
                this.activate
            );


            this.trigger.removeEventListener(
                "focusout",
                this.deactivate
            );

        }


        this.dataset.initialized =
            "false";

    }

}



/* ============================================================
   REGISTER COMPONENT
============================================================ */

if (
    !customElements.get(
        "portfolio-arrow"
    )
) {

    customElements.define(
        "portfolio-arrow",
        PortfolioArrow
    );

}