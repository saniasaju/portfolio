/* CampInn navbar links return to the homepage. Scroll behavior is shared in portfolio.js. */
document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".campinn-page__navbar");
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



});
