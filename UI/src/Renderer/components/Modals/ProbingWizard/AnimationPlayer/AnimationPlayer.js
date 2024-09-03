import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core";
import zIndex from "@material-ui/core/styles/zIndex";

const styles = (theme) => ({
    container: {
        display: "grid",
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
    const timerRef = useRef(null);
    const videoRef = useRef(null);
    const videoRef2 = useRef(null);
    const animationIndexRef = useRef(0);
    const repeatCountRef = useRef(0);

    useEffect(() => {
        console.log(" ");
        if (props.animations.length === 0) {
            return;
        }
        const videoElement = videoRef.current;
        const videoElement2 = videoRef2.current;
        let activeVideo = videoElement;
        let inactiveVideo = videoElement2;
        let currentAnimation = animations[animationIndexRef.current];
        let nextAnimation;

        console.log("activeVideo: " + activeVideo);
        console.log("inactiveVideo: " + inactiveVideo);

        const handleTransitionEnd = () => {
            console.log("handleTransitionEnd started");
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
            console.log("handleTransitionEnd done");
        };

        const handleVideoEnd = () => {
            console.log("handleVideoEnd started");
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
            timerRef.current = setTimeout(() => {
                activeVideo.addEventListener(
                    "transitionend",
                    handleTransitionEnd
                );

                activeVideo.classList.remove(props.classes.hidden);
                activeVideo.classList.add(props.classes.visible);

                inactiveVideo.classList.remove(props.classes.visible);
                inactiveVideo.classList.add(props.classes.hidden);

                // Listen for the transition to complete on the active video

                // Attach the transitionend event listener
                console.log("setTimeout done");
            }, 3000); // Adjust timing as needed
            console.log("handleVideoEnd done");
        };

        activeVideo.addEventListener("ended", handleVideoEnd);
        activeVideo.src = currentAnimation.src;
        activeVideo.playbackRate = currentAnimation.speed;

        activeVideo.play();

        console.log("useEffect done, no cleanup");
        return () => {
            clearTimeout(timerRef.current);
            videoElement.pause();
            videoElement2.pause();
            videoElement.removeEventListener("ended", handleVideoEnd);
            videoElement2.removeEventListener("ended", handleVideoEnd);
            videoElement.removeEventListener(
                "transitionend",
                handleTransitionEnd
            );
            videoElement2.removeEventListener(
                "transitionend",
                handleTransitionEnd
            );
            videoElement.classList.remove(props.classes.hidden);
            videoElement.classList.add(props.classes.visible);
            videoElement2.classList.remove(props.classes.visible);
            videoElement2.classList.add(props.classes.hidden);
            console.log("cleanup done");
            videoElement.src = "";
            videoElement2.src = "";
            videoElement.load();
            videoElement2.load();
            animationIndexRef.current = 0;
        };
    }, [
        props.featureType,
        props.locationType,
        props.probeXSide,
        props.probeYSide,
        props.probeCorner,
    ]);

    if (animations.length === 0) {
        return <></>;
    } else {
        return (
            <>
                <div
                    className={props.classes.container}
                    style={{
                        marginTop: "10px",
                        boxShadow: "3px 3px 0px 0px #000000",
                        border: "2px solid black",
                    }}
                >
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
    }
};

export default withStyles(styles)(AnimationPlayer);
