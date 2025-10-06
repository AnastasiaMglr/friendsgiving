import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";
import characters from "../assets/friends.json";
import "./CharactersPage.css"; // fichier CSS pour le style
import { bgAudio, fadeAudio } from "./audioSingleton";

const CharacterPopup = ({ char, onSelect }) => {
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (char.images && char.images.length > 1) {
      const interval = setInterval(() => {
        setImgIndex((prev) => (prev + 1) % char.images.length);
      }, 600); // 2 minutes
      return () => clearInterval(interval);
    }
  }, [char.images]);

  return (
    <div className="character-popup">
      <div className="character-popup-left">
        <h2 className="character-name">{char.name}</h2>
        <p>
          <span className="attribute-label">Strengths:</span>
          <span className="attribute-text">{char.strengths}</span>
        </p>
        <p>
          <span className="attribute-label">Weaknesses:</span>
          <span className="attribute-text">{char.weaknesses}</span>
        </p>
        <button onClick={onSelect}>Select</button>
      </div>

      {/* Render right side ONLY if images exist */}
      {char.images && char.images.length > 0 && (
        <div className="character-popup-right">
          <img src={char.images[imgIndex]} alt={char.name} />
        </div>
      )}
    </div>
  );
};



const CharactersPage = () => {

  const [fadeOut, setFadeOut] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharacters, setShowCharacters] = useState(false);
  const [showCharactersVisible, setShowCharactersVisible] = useState(false); // triggers CSS .show
  const { setUser } = useUser();
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);

  const navigate = useNavigate();

  const audioRef = useRef(null);
  const hoverSoundRef = useRef(null);
  const cardHoverSoundRef = useRef(null);
  const audioContextRef = useRef(null);
  const clickSoundRef = useRef(null);

  useEffect(() => {
    if (showCharacters) {
      // garantit que l'élément est monté en DOM avec opacity:0 avant d'ajouter .show
      requestAnimationFrame(() => {
        // petit délai optionnel sur certains navigateurs : setTimeout(() => setShowCharactersVisible(true), 0)
        setShowCharactersVisible(true);
      });
    } else {
      setShowCharactersVisible(false);
    }
  }, [showCharacters]);

  useEffect(() => {
  document.body.className = "characters-page";
  return () => {
    document.body.className = "";
    };
  }, []);

  useEffect(() => {
    hoverSoundRef.current = new Audio("/sound_effects/click.mp3");
    hoverSoundRef.current.volume = 1;
  }, []);

const handleArrowHover = async () => {
  // Créer et connecter AudioContext **au premier hover**
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioContextRef.current;

    const sound = hoverSoundRef.current;
    const track = ctx.createMediaElementSource(sound);
    const gainNode = ctx.createGain();
    gainNode.gain.value = 1.5;
    track.connect(gainNode).connect(ctx.destination);
  }
  
  const ctx = audioContextRef.current;
  const sound = hoverSoundRef.current;

  if (!ctx || !sound) return;

  // Resume obligatoire
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  sound.currentTime = 0;
  sound.play().catch((err) => console.log("Lecture bloquée :", err));
};


  /*Launch music*/
const handleShowCharacters = () => {
    // Créer l'audio une seule fois
    if (!audioRef.current) {
      audioRef.current = new Audio("/ChooseYourCharacter.mp3");
      audioRef.current.volume = 0.5;
    }
    // Jouer la musique
    audioRef.current.play().catch((err) => {
      console.log("Lecture bloquée par le navigateur :", err);
    });
    // Afficher la liste
    setFadeOut(true);

    setTimeout(() => {
      setShowCharacters(true);
    }, 2000); // doit correspondre à la durée CSS du fade
  };

const toggleMusic = () => {
  if (!audioRef.current) return;

  if (isMusicPlaying) {
    audioRef.current.pause();
  } else {
    audioRef.current.play().catch((err) => console.log("Lecture bloquée :", err));
  }
  setIsMusicPlaying(!isMusicPlaying);
};

  /*Sound effect Hover character-card*/
useEffect(() => {
    cardHoverSoundRef.current = new Audio("/sound_effects/sound_select.mp3");
    cardHoverSoundRef.current.volume = 1;
    clickSoundRef.current = new Audio("/sound_effects/confirm.mp3");
  }, []);

  const handleCardHover = () => {
    const sound = cardHoverSoundRef.current;
    if (sound) {
      sound.currentTime = 0; // recommence à chaque hover
      sound.play().catch((err) => console.log("Lecture bloquée :", err));
    }
  };

  const playClickSound = () => {
    if (audioContextRef.current && clickSoundRef.current) {
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
      const sound = clickSoundRef.current.cloneNode();
      sound.volume = 0.6;
      sound.play();
    }
  };

  const handleCardClick = (char) => {
    playClickSound(); // 🔊 joue le son avant de faire l’action
    setSelectedCharacter(selectedCharacter === char ? null : char);
  };

const handleSelect = async (char) => {
  playClickSound(); // effet sonore

  // 1️⃣ Lancer le fondu visuel de la page characters
  const root = document.querySelector(".characters-page");
  if (root) root.classList.add("page-fade-out");

  // 2️⃣ Fondu progressif de la musique actuelle
  if (audioRef.current) {
    const fadeOutDuration = 2000;
    const steps = 20;
    const interval = fadeOutDuration / steps;
    const initialVolume = audioRef.current.volume;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = initialVolume * (1 - currentStep / steps);
      audioRef.current.volume = Math.max(newVolume, 0);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, interval);
  }

  // 3️⃣ Après fondu audio + visuel → naviguer vers menu
    setTimeout(() => {
      setUser(char);
      navigate("/menu");

      bgAudio.src = "/friends_theme_short.mp3";
      bgAudio.volume = 0;
      bgAudio.loop = true;

      bgAudio
        .play()
        .then(() => fadeAudio(bgAudio, 0.5, 5000))
        .catch((err) => console.log("Lecture bloquée :", err));
    }, 2000);
};

  return (
    <div className="characters-page">
        {!showCharacters ? (
        <div className={`intro ${fadeOut ? "fade-out" : ""}`} >
          <h1 className={`intro-title ${fadeOut ? "fade-out" : ""}`}>Start</h1>
          <div 
            className="arrow"
            onMouseEnter={handleArrowHover} 
            onClick={handleShowCharacters}
            style={{ fontSize: "3rem", cursor: "pointer" }}
          >
            <img 
              src="/start.png"
              alt="arrow" 
            />
          </div>
        </div>
      ) : (
        <>
      <h1 className={`characters-list ${showCharactersVisible ? "show" : ""}`}>
        Characters
      </h1>
      <div className={`characters-grid ${showCharactersVisible ? "show" : ""}`}>
        {Object.values(characters).map((char) => (
          <div className="character-card" 
          key={char.name}
          onMouseEnter={handleCardHover}
          onClick={() => handleCardClick(char)}
          >
            {char.profile && char.profile.length > 0 ? (
              <>
                <p className="character-name">{char.name}</p>
                <img
                  src={char.profile} // show first image
                  alt={char.name}
                  className="character-image"
                />
              </>
            ) : (
              // Otherwise fallback to card look
              <p className="character-name">{char.name}</p>
            )}
            {selectedCharacter === char &&
              ReactDOM.createPortal(
              <CharacterPopup
                char={char}
                onSelect={(e) => { e.stopPropagation(); handleSelect(char); }}
              />,
                document.body
              )}
          </div>
        ))}
      </div>
        {/*Lecteur musique */}
        <div className="music-toggle" onClick={toggleMusic}>
          {isMusicPlaying ? "🔊 Music ON" : "🔇 Music OFF"}
        </div>
      </>
      )}
    </div>
  );
};

export default CharactersPage;
