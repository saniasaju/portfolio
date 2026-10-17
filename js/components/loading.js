(() => {
    const loadingScreen = document.querySelector(".loading-screen");
    const loadingVideo = document.querySelector(".loading-screen__video");

    const loadingAnimation = new Promise(resolve => {
        if (!loadingVideo) {
            resolve();
            return;
        }

        // Show the original animation once, even on a warm browser cache.
        // Continue looping afterward if the page's assets are still loading.
        loadingVideo.loop = false;
        loadingVideo.muted = true;
        loadingVideo.addEventListener("ended", () => {
            resolve();
            loadingVideo.loop = true;
            loadingVideo.play()?.catch(() => {});
        }, { once: true });
        loadingVideo.addEventListener("error", resolve, { once: true });
        loadingVideo.querySelectorAll("source").forEach(source => {
            source.addEventListener("error", resolve, { once: true });
        });

        if (loadingVideo.error || loadingVideo.ended) resolve();
        else loadingVideo.play()?.catch(resolve);
    });

    const pageLoaded = new Promise(resolve => {
        if (document.readyState === "complete") resolve();
        else window.addEventListener("load", resolve, { once: true });
    });

    async function loadImage(image) {
        // Include the below-the-fold gallery instead of waiting for scrolling.
        image.loading = "eager";
        if (!image.complete) {
            await new Promise(resolve => {
                image.addEventListener("load", resolve, { once: true });
                image.addEventListener("error", resolve, { once: true });
            });
        }
        if (image.naturalWidth && image.decode) await image.decode();
    }

    async function loadVideo(video) {
        const source = video.currentSrc || video.getAttribute("src") ||
            video.querySelector("source[src]")?.src;
        if (!source) return;

        // Media preload can stop after metadata or a partial buffer.
        // Download the complete file and reuse it for playback.
        const response = await fetch(source, { cache: "force-cache" });
        if (!response.ok) throw new Error(`Video failed to load: ${source}`);
        const url = URL.createObjectURL(await response.blob());

        await new Promise(resolve => {
            video.addEventListener("loadeddata", resolve, { once: true });
            video.addEventListener("error", () => {
                URL.revokeObjectURL(url);
                resolve();
            }, { once: true });
            video.preload = "auto";
            video.src = url;
            video.load();
        });
    }

    async function initializeLoading() {
        // Components render synchronously before DOMContentLoaded.
        const assets = [
            ...Array.from(document.images, loadImage),
            ...Array.from(document.querySelectorAll(".home video"), loadVideo)
        ];
        // Attach rejection handlers immediately, even while window.load is pending.
        const mediaReady = Promise.allSettled(assets);

        await pageLoaded;

        const backgrounds = new Set();
        document.querySelectorAll(".home, .home *").forEach(element => {
            [null, "::before", "::after"].forEach(pseudo => {
                const background = getComputedStyle(element, pseudo).backgroundImage;
                for (const match of background.matchAll(/url\(["']?(.*?)["']?\)/g)) {
                    backgrounds.add(match[1]);
                }
            });
        });

        const backgroundImages = Array.from(backgrounds, source => {
            const image = new Image();
            image.src = source;
            return loadImage(image);
        });
        const fonts = document.fonts ?
            Array.from(document.fonts, font => font.load()) : [];

        // Failed assets must not trap visitors behind the loading screen.
        await Promise.allSettled([
            loadingAnimation, mediaReady, ...backgroundImages, ...fonts
        ]);
        if (document.fonts) await document.fonts.ready;

        loadingScreen?.classList.add("is-finished");
        loadingVideo?.pause();
        document.body.classList.remove("is-loading");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeLoading, { once: true });
    } else {
        initializeLoading();
    }
})();
