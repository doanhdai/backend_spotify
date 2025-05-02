// components/PlayerProvider.jsx
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSongs, setTrack, setTime, setPlayStatus, next, seekTo } from '@/redux/Reducer/playerSlice';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PremiumModal from '@/components/PremiumModal/PremiumModal';

const PlayerProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { track, playStatus, volume, time, status, currentIndex, currentPlaylist } = useSelector(
        (state) => state.player,
    );
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [hasShownPremiumModal, setHasShownPremiumModal] = useState(false);
    const is_premium = localStorage.getItem('is_premium');
    const audioRef = useRef();

    // Function to get currently playing track
    const getCurrentTrack = () => {
        if (track) {
            return {
                ...track,
                currentTime: time.currentTime,
                isPlaying: playStatus,
                index: currentIndex,
            };
        }
        return null;
    };

    // Example of using the current track
    useEffect(() => {
        const currentTrack = getCurrentTrack();
        if (currentTrack) {
            console.log(currentTrack);
            if (currentTrack.is_premium === true && time.currentTime.second === 5) {
                if (audioRef.current && is_premium === 'false') {
                    audioRef.current.pause();
                    dispatch(setPlayStatus(false));
                    setShowPremiumModal(true);
                }

                if (is_premium === 'true') {
                    audioRef.current.play();
                    dispatch(setPlayStatus(true));
                }
            }
        }
    }, [track, time, playStatus, setHasShownPremiumModal]);

    useEffect(() => {
        dispatch(fetchAllSongs());
    }, [dispatch]);

    useEffect(() => {
        if (status === 'succeeded') {
            const savedState = JSON.parse(localStorage.getItem('musicPlayerState'));
            if (savedState?.track && audioRef.current) {
                dispatch(setTrack(savedState.track));
                const savedPlayStatus = savedState.playStatus || false;
                const savedTime = savedState.currentTime || 0;

                audioRef.current.src = savedState.track.audio;
                audioRef.current.currentTime = savedTime;
                dispatch(seekTo(savedTime));

                dispatch(setPlayStatus(savedPlayStatus));
                if (savedPlayStatus) {
                    audioRef.current.play().catch((error) => {
                        console.error('Lỗi phát nhạc khi khôi phục:', error);
                    });
                }
            }
        }
    }, [status, dispatch]);

    // Handle song end
    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => {
            if (currentIndex < currentPlaylist.length - 1) {
                dispatch(next());
            } else {
                dispatch(setPlayStatus(false));
            }
        };

        if (audio) {
            audio.onended = handleEnded;
        }

        return () => {
            if (audio) {
                audio.onended = null;
            }
        };
    }, [currentIndex, currentPlaylist, dispatch]);

    // Handle track change
    useEffect(() => {
        const audio = audioRef.current;
        if (track?.audio && audio) {
            if (audio.src !== track.audio) {
                audio.src = track.audio;
                audio.load();
                audio.currentTime = time.currentTime.minute * 60 + time.currentTime.second || 0;
            }
        }
    }, [track, time]);

    // Handle play/pause separately
    useEffect(() => {
        const audio = audioRef.current;
        if (track?.audio && audio) {
            if (playStatus) {
                audio.play().catch((error) => console.error('Lỗi phát nhạc:', error));
            } else {
                audio.pause();
            }
        }
    }, [playStatus, track]);

    // Update time during playback
    useEffect(() => {
        const updateTime = () => {
            if (audioRef.current && audioRef.current.readyState >= 2) {
                const currentTime = audioRef.current.currentTime;
                const duration = audioRef.current.duration;
                dispatch(
                    setTime({
                        currentTime: {
                            second: Math.floor(currentTime % 60),
                            minute: Math.floor(currentTime / 60),
                        },
                        totalTime: {
                            second: Math.floor(duration % 60),
                            minute: Math.floor(duration / 60),
                        },
                    }),
                );
            }
        };

        if (audioRef.current) {
            audioRef.current.ontimeupdate = updateTime;
            audioRef.current.volume = volume;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.ontimeupdate = null;
            }
        };
    }, [volume, dispatch]);

    // Save state to localStorage
    useEffect(() => {
        if (track && audioRef.current) {
            const currentState = {
                track,
                currentTime: audioRef.current.currentTime || 0,
                playStatus,
            };
            localStorage.setItem('musicPlayerState', JSON.stringify(currentState));
        }
    }, [track, time, playStatus]);

    return (
        <>
            <audio ref={audioRef} />
            {showPremiumModal && (
                <PremiumModal
                    onClose={() => setShowPremiumModal(false)}
                    trackName={track?.title || 'This track'}
                    setShowPremiumModal={setShowPremiumModal}
                />
            )}
            {children}
        </>
    );
};

export default PlayerProvider;
