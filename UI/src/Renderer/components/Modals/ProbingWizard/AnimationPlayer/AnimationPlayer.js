import React, { useState, useEffect, useRef } from "react";

const AnimationPlayer = (props) => {
    const animations = props.animations;

    const videoRef = useRef(null);
    const animationIndexRef = useRef(0);
    const repeatCountRef = useRef(0);

    useEffect(() => {
        const videoElement = videoRef.current;

        const playNextAnimation = () => {
            if (animationIndexRef.current >= animations.length) {
                animationIndexRef.current = 0;
            }
            const currentAnimation = animations[animationIndexRef.current];
            videoElement.src = currentAnimation.src;
            videoElement.playbackRate = currentAnimation.speed;
            videoElement.play();
            repeatCountRef.current += 1;
        };

        const handleVideoEnd = () => {
            const currentAnimation = animations[animationIndexRef.current];
            if (repeatCountRef.current >= currentAnimation.repeat) {
                videoElement.pause();
                setTimeout(() => {
                    repeatCountRef.current = 0;
                    animationIndexRef.current += 1;
                    playNextAnimation();
                }, 3000);
            } else {
                playNextAnimation();
            }
        };

        videoElement.addEventListener("ended", handleVideoEnd);

        playNextAnimation(); // Start the first animation

        return () => {
            videoElement.removeEventListener("ended", handleVideoEnd);
        };
    }, []);

    return <video style={{maxWidth: "100%"}} ref={videoRef} muted />;
};

export default AnimationPlayer;
