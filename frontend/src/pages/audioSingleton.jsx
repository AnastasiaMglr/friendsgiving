// audioSingleton.js
export const bgAudio = new Audio("/music/friends_theme_short.mp3");

bgAudio.loop = true;
bgAudio.volume = 0.5;

// fonction utilitaire : fade-in / fade-out
export const fadeAudio = (audio, targetVolume, duration = 2000) => {
  const steps = 20;
  const interval = duration / steps;
  const diff = targetVolume - audio.volume;
  let currentStep = 0;

  const fadeInterval = setInterval(() => {
    currentStep++;
    audio.volume = Math.min(Math.max(audio.volume + diff / steps, 0), 1);
    if (currentStep >= steps) clearInterval(fadeInterval);
  }, interval);
};

export const fadeOutAudio = (audio, duration = 1000) => {
  return new Promise((resolve) => {
    if (!audio) return resolve();
    const step = audio.volume / (duration / 50);
    const fade = setInterval(() => {
      audio.volume = Math.max(0, audio.volume - step);
      if (audio.volume <= 0.01) {
        clearInterval(fade);
        audio.pause();
        resolve();
      }
    }, 50);
  });
};

export const fadeInAudio = (audio, duration = 1000, targetVolume = 1) => {
  audio.volume = 0;
  audio.play();
  const step = targetVolume / (duration / 50);
  const fade = setInterval(() => {
    audio.volume = Math.min(targetVolume, audio.volume + step);
    if (audio.volume >= targetVolume) clearInterval(fade);
  }, 50);
};