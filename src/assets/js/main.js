import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    initSpotlightAnimations();
    window.addEventListener("resize", initSpotlightAnimations);

    function initSpotlightAnimations() {
        const images = document.querySelectorAll(".img");
        const coverImg = document.querySelector(".spotlight-cover-img");
        const introHeader = document.querySelector(".spotlight-intro-header");
        const outroHeader = document.querySelector(".spotlight-outro-header");

        let introHeaderSplit = null;
        let outroHeaderSplit = null;

        introHeaderSplit = SplitText.create(introHeader, { type: "words" });
        gsap.set(introHeaderSplit.words, { opacity: 1 });

        outroHeaderSplit = SplitText.create(outroHeader, { type: "words" });
        gsap.set(outroHeaderSplit.words, { opacity: 0 });
        gsap.set(outroHeader.words, { opacity: 1 });

        const scatterDirections = [
            { x: 1.3, y: 0.7 },
            { x: -1.5, y: 1.0 },
            { x: 1.1, y: -1.3 },
            { x: -1.7, y: -0.8 },
            { x: 0.8, y: 1.5 },

            { x: -1.0, y: -1.4 },
            { x: 1.6, y: 0.3 },
            { x: -0.7, y: 1.7 },
            { x: 1.2, y: -1.6 },
            { x: -1.4, y: 0.9 },

            { x: 1.8, y: -0.5 },
            { x: -1.1, y: -1.8 },
            { x: 0.9, y: 1.8 },
            { x: -1.9, y: 0.4 },
            { x: 1.0, y: -1.9 },

            { x: -0.8, y: 1.9 },
            { x: 1.7, y: -1.0 },
            { x: -1.3, y: -1.2 },
            { x: 0.7, y: 2.0 },
            { x: 1.25, y: -0.2 },
        ];

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const isMobile = screenWidth < 1000;
        const scatterMultiplier = isMobile ? 2.5 : 0.5;

        const startPositions = Array.from(images).map(() => ({
            x: 0,
            y: 0,
            z: -1000,
            scale: 0,
        }));

        const endPositions = scatterDirections.map((dir) => ({
            x: dir.x * screenWidth * scatterMultiplier,
            y: dir.y * screenHeight * scatterMultiplier,
            z: 2000,
            scale: 1,
        }));

        images.forEach((img, index) => {
            gsap.set(img, startPositions[index]);
        });

        gsap.set(coverImg, {
            z: -1000,
            scale: 0,
            x: 0,
            y: 0,
        });

        ScrollTrigger.create({
            trigger: ".spotlight",
            start: "top top",
            end: `+=${window.innerHeight * 15}px`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;

                images.forEach((img, index) => {
                    const staggerDelay = index * 0.03;
                    const scaleMultiplier = isMobile ? 4 : 2;

                    let imageProgress = Math.max(0, (progress - staggerDelay) * 4);

                    const start = startPositions[index];
                    const end = endPositions[index];

                    const zValue = gsap.utils.interpolate(start.z, end.z, imageProgress);
                    const xValue = gsap.utils.interpolate(start.x, end.x, imageProgress);
                    const yValue = gsap.utils.interpolate(start.y, end.y, imageProgress);

                    const scaleValue = gsap.utils.interpolate(start.scale, end.scale, imageProgress * scaleMultiplier);

                    gsap.set(img, {
                        z: zValue,
                        scale: scaleValue,
                        x: xValue,
                        y: yValue,
                    });
                }); //can show 1

                const coverProgress = Math.max(0, (progress - 0.7) * 4);
                const coverZValue = -1000 + 1000 * coverProgress;
                const coverScaleValue = Math.min(1, coverProgress * 2);

                gsap.set(coverImg, {
                    z: coverImg,
                    scale: coverScaleValue,
                    x: 0,
                    y: 0,
                }); //can show 2

                if (introHeaderSplit && introHeaderSplit.words.length > 0) {
                    if (progress >= 0.6 && progress <= 0.75) {
                        const introFadeProgress = (progress - 0.6) / 0.15;
                        const totalWords = introHeaderSplit.words.length;

                        introHeaderSplit.words.forEach((word, index) => {
                            const wordFadeProgress = index / totalWords;
                            const fadeRange = 0.1;

                            if (introFadeProgress >= wordFadeProgress + fadeRange) {
                                gsap.set(word, { opacity: 0 });
                            } else if (introFadeProgress <= wordFadeProgress) {
                                gsap.set(word, { opacity: 1 });
                            } else {
                                const wordOpacity = 1 - (introFadeProgress - wordFadeProgress) / fadeRange;

                                gsap.set(word, { opacity: wordOpacity });
                            }
                        });
                    } else if (progress < 0.6) {
                        gsap.set(introHeaderSplit.words, { opacity: 1 });
                    } else if (progress > 0.75) {
                        gsap.set(introHeaderSplit.words, { opacity: 0 });
                    }
                } //can show 3

                if (outroHeaderSplit && outroHeaderSplit.words.length > 0) {
                    if (progress >= 0.8 && progress <= 0.95) {
                        const outroRevealProgress = (progress - 0.8) / 0.15;
                        const totalWords = outroHeaderSplit.words.length;

                        outroHeaderSplit.words.forEach((word, index) => {
                            const wordRevealProgress = index / totalWords;
                            const fadeRange = 0.1;

                            if (outroRevealProgress >= wordRevealProgress + fadeRange) {
                                gsap.set(word, { opacity: 1 });
                            } else if (outroRevealProgress <= wordRevealProgress) {
                                gsap.set(word, { opacity: 0 });
                            } else {
                                const wordOpacity = (outroRevealProgress - wordRevealProgress) / fadeRange;

                                gsap.set(word, { opacity: wordOpacity });
                            }
                        });
                    } else if (progress < 0.8) {
                        gsap.set(outroHeaderSplit.words, { opacity: 0 });
                    } else if (progress > 0.95) {
                        gsap.set(outroHeaderSplit.words, { opacity: 1 });
                    }
                }
            },
        });
    }
});
