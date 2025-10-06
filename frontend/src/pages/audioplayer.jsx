import React, { useState, useEffect } from "react";
import { bgAudio, fadeAudio } from "./audioSingleton";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(!bgAudio.paused);

  const togglePlay = () => {
    if (isPlaying) {
      fadeAudio(bgAudio, 0, 1000);
      setTimeout(() => bgAudio.pause(), 1000);
      setIsPlaying(false);
    } else {
      bgAudio.play();
      fadeAudio(bgAudio, 0.5, 1000);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    setIsPlaying(!bgAudio.paused);
  }, []);

  return (
    <button className="audio-player">
      <div onClick={togglePlay}>
        {isPlaying ? "Pause" : "Play ▶"}
      </div>
    </button>
  );
}
