import { useState, useRef } from "react"

const useAudio = (initialAudioSrc = "", volume = 1) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const audioRef = useRef(new Audio(initialAudioSrc))

    const play = () => {
        stop()

        audioRef.current.play()
        audioRef.current.volume = volume
        setIsPlaying(true)
    }

    const pause = () => {
        audioRef.current.pause()
        setIsPlaying(false)
    }

    const stop = () => {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        setIsPlaying(false)
    }

    const setAudioSrc = (src) => {
        if (audioRef.current) {
            audioRef.current.pause()
        }
        audioRef.current = new Audio(src)
        setIsPlaying(false)
    }

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime)
    }

    const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration)
    }

    // Event listeners
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate)
    audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata)

    // Cleanup listeners on unmount
    const cleanup = () => {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate)
        audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }

    return {
        isPlaying,
        currentTime,
        duration,
        play,
        pause,
        stop,
        setAudioSrc,
        cleanup
    }
}

export default useAudio
