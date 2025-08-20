"use client";
import { useEffect, useRef, useState } from "react";

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Position state (start at 0,0 until client loads)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);

  useEffect(() => {
    // Set initial position safely on client
    setPosition({ x: window.innerWidth - 120, y: window.innerHeight - 80 });

    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.loop = true;
      const playAudio = async () => {
        try {
          await audioRef.current?.play();
        } catch {
          setIsPlaying(false);
        }
      };
      playAudio();
    }
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle drag (desktop + mobile)
  const handleMouseDown = () => {
    dragging.current = true;
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging.current) {
      setPosition({ x: e.clientX - 50, y: e.clientY - 25 });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (dragging.current && e.touches[0]) {
      setPosition({ x: e.touches[0].clientX - 50, y: e.touches[0].clientY - 25 });
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  return (
    <div
      className="fixed z-50"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      <button
        onClick={toggleAudio}
        className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-full shadow-lg border border-yellow-600 hover:bg-yellow-500 transition cursor-move active:scale-95"
      >
        {isPlaying ? "🔊 Mute" : "🔇 Unmute"}
      </button>
      <audio
        ref={audioRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        autoPlay
      />
    </div>
  );
}
