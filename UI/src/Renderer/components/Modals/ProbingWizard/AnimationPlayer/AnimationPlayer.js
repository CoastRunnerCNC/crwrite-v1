import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core";
import zIndex from "@material-ui/core/styles/zIndex";

const styles = (theme) => ({
    container: {
        display: "grid",
        width: "100%",
        height: "100%",
    },
    secondVideoPlayer: {
        gridArea: "1 / 1 / 2 / 2",
        transition: "opacity 1s ease-in-out",
    },
    firstVideoPlayer: {
        gridArea: "1 / 1 / 2 / 2",
        transition: "opacity 1s ease-in-out",
    },
    hidden: {
        zIndex: 1,
        opacity: 0,
    },
    visible: {
        zIndex: 2,
        opacity: 1,
    },
});

const AnimationPlayer = (props) => {
    const animations = props.animations;

    const videoRef = useRef(null);
    const videoRef2 = useRef(null);
    const animationIndexRef = useRef(0);
    const repeatCountRef = useRef(0);

    useEffect(() => {
        const videoElement = videoRef.current;
        const videoElement2 = videoRef2.current;
        let activeVideo = videoElement;
        let inactiveVideo = videoElement2;
        let currentAnimation = animations[animationIndexRef.current];
        let nextAnimation;

        const handleVideoEnd = () => {
            if (animationIndexRef.current + 1 === animations.length) {
                animationIndexRef.current = 0;
            } else {
                ++animationIndexRef.current;
            }
            currentAnimation = animations[animationIndexRef.current];

            if (animationIndexRef.current + 1 === animations.length) {
                nextAnimation = animations[0];
            } else {
                nextAnimation = animations[animationIndexRef.current + 1];
            }

            // cleanup old listener
            activeVideo.removeEventListener("ended", handleVideoEnd);

            // when video ends, set activeVideo to other videoElement
            activeVideo =
                activeVideo === videoElement ? videoElement2 : videoElement;
            inactiveVideo =
                activeVideo === videoElement ? videoElement2 : videoElement;

            // attach new listener to active video
            activeVideo.addEventListener("ended", handleVideoEnd);

            // setup all video props
            activeVideo.src = currentAnimation.src;
            activeVideo.playbackRate = currentAnimation.speed;

            // start transition
            setTimeout(() => {
                activeVideo.classList.remove(props.classes.hidden);
                activeVideo.classList.add(props.classes.visible);

                inactiveVideo.classList.remove(props.classes.visible);
                inactiveVideo.classList.add(props.classes.hidden);

                // Listen for the transition to complete on the active video
                const handleTransitionEnd = () => {
                    // move inactive video to active video index plus 1 unless activeVideo is at end of array
                    inactiveVideo.src = nextAnimation.src;
                    inactiveVideo.playbackRate = nextAnimation.speed;

                    // play active video
                    activeVideo.play();

                    // Remove the transitionend listener after it completes
                    activeVideo.removeEventListener(
                        "transitionend",
                        handleTransitionEnd
                    );
                };

                // Attach the transitionend event listener
                activeVideo.addEventListener(
                    "transitionend",
                    handleTransitionEnd
                );
            }, 3000); // Adjust timing as needed
        };

        activeVideo.addEventListener("ended", handleVideoEnd);
        activeVideo.src = currentAnimation.src;
        activeVideo.playbackRate = currentAnimation.speed;

        activeVideo.play();

        return () => {
            videoElement.removeEventListener("ended", handleVideoEnd);
            videoElement2.removeEventListener("ended", handleVideoEnd);
        };

        /////////////////////////////////////////////////////////////////////////

        // const videoElement = videoRef.current;
        // const videoElement2 = videoRef2.current;

        // const playNextAnimation = () => {
        //     if (animationIndexRef.current >= animations.length) {
        //         animationIndexRef.current = 0;
        //     }

        //     const currentAnimation = animations[animationIndexRef.current];
        //     let nextAnimation;

        //     if ((animationIndexRef.current + 1) === animations.length) {
        //         nextAnimation = animations[0];
        //     } else {
        //         nextAnimation = animations[animationIndexRef.current + 1];
        //     }
        //     // play first animation

        //     videoElement.src = currentAnimation.src;
        //     videoElement.playbackRate = currentAnimation.speed;
        //     videoElement.play();

        //     // setup second animation but don't play

        //     videoElement2.src = nextAnimation.src;
        //     videoElement2.playbackRate = nextAnimation.speed;

        //     repeatCountRef.current += 1;
        // };

        // const handleVideoEnd = () => {
        //     // switch z-index of animations

        //     // playNextAnimation

        //     const currentAnimation = animations[animationIndexRef.current];
        //     if (repeatCountRef.current >= currentAnimation.repeat) {
        //         videoElement.pause();
        //         setTimeout(() => {
        //             repeatCountRef.current = 0;
        //             animationIndexRef.current += 1;
        //             playNextAnimation();
        //         }, 3000);
        //     } else {
        //         playNextAnimation();
        //     }
        // };

        // videoElement.addEventListener("ended", handleVideoEnd);

        // playNextAnimation(); // Start the first animation

        // return () => {
        //     videoElement.removeEventListener("ended", handleVideoEnd);
        // };
    }, []);

    return (
        <>
            <div className={props.classes.container}>
                <video
                    className={`${props.classes.firstVideoPlayer} ${props.classes.visible}`}
                    style={{ maxWidth: "100%" }}
                    ref={videoRef}
                    muted
                />
                <video
                    className={`${props.classes.secondVideoPlayer} ${props.classes.hidden}`}
                    style={{ maxWidth: "100%" }}
                    ref={videoRef2}
                    muted
                />
            </div>
        </>
    );
};

export default withStyles(styles)(AnimationPlayer);
