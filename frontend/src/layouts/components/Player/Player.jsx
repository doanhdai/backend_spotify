import React, { useState, useRef, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '@/assets/assets';
import config from '@/configs';
import { useSelector, useDispatch } from 'react-redux';
import { setPlayStatus, setVolume, playWithId, seekTo, previous, next } from '@/redux/Reducer/playerSlice';
import { GoMute, GoUnmute } from 'react-icons/go';
import { useTranslation } from 'react-i18next';

function Player() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const {
        track,
        playStatus,
        time,
        volume: reduxVolume,
        currentIndex,
        currentPlaylist,
    } = useSelector((state) => state.player);

    const navigate = useNavigate();
    const seekBg = useRef();
    const seekBar = useRef();
    const [volume, setVolumeState] = useState(reduxVolume || 0.5);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (seekBar.current && time.totalTime.second >= 0 && time.totalTime.minute >= 0) {
            const totalSeconds = time.totalTime.minute * 60 + time.totalTime.second;
            const currentSeconds = time.currentTime.minute * 60 + time.currentTime.second;
            const width = totalSeconds > 0 ? (currentSeconds / totalSeconds) * 100 : 0;
            seekBar.current.style.width = `${width}%`;
        }
    }, [time]);

    useEffect(() => {
        if (seekBar.current) {
            seekBar.current.style.width = '0%';
        }
    }, [track]);

    const play = () => {
        const audio = document.querySelector('audio');
        if (audio) {
            audio.play().then(() => dispatch(setPlayStatus(true)));
        }
    };

    const pause = () => {
        const audio = document.querySelector('audio');
        if (audio) {
            audio.pause();
            dispatch(setPlayStatus(false));
        }
    };

    const handlePrevious = () => {
        if (currentIndex <= 0) {
            console.warn('No previous song available');
            return;
        }
        dispatch(previous());
    };

    const handleNext = () => {
        if (currentIndex >= currentPlaylist.length - 1) {
            console.warn('No next song available');
            return;
        }
        dispatch(next());
    };

    const seekSong = (e) => {
        const audio = document.querySelector('audio');
        if (!track || !audio || !seekBg.current || seekBg.current.offsetWidth <= 0 || isNaN(audio.duration)) {
            console.warn('Cannot seek: Invalid state or audio duration');
            return;
        }
        const newCurrentTime = (e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audio.duration;
        audio.currentTime = newCurrentTime;
        dispatch(seekTo(newCurrentTime));
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolumeState(newVolume);
        dispatch(setVolume(newVolume));
        setIsMuted(newVolume === 0);
    };

    const handleMuteClick = () => {
        const newVolume = isMuted ? 0.5 : 0;
        setIsMuted(!isMuted);
        setVolumeState(newVolume);
        dispatch(setVolume(newVolume));
    };

    const playVideo = () => {
        if (track?.video) {
            navigate(`/video/${track.id}`); // Điều hướng đến trang video
        }
    };

    return (
        <>
            {track ? (
                <div className="h-[10%] bg-black flex justify-between items-center text-white px-4">
                    <div
                        className="hidden lg:flex items-center gap-4 w-64"
                        onClick={() => {
                            navigate(`${config.routes.detailSong}/${track.id}`);
                        }}
                    >
                        <img className="w-12" src={track.hinh_anh} alt="Track Cover" />
                        <div>
                            <p>{track.ten_bai_hat}</p>
                            <p className="text-[12px] text-[#b3b3b3]">{track.ma_user?.name}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 m-auto">
                        <div className="flex gap-4">
                            <Tippy content={t('controls.shuffle')}>
                                <img className="w-4 cursor-pointer" src={assets.shuffle_icon} alt="Shuffle" />
                            </Tippy>
                            <Tippy content={t('controls.previous')}>
                                <img
                                    onClick={handlePrevious}
                                    className="w-4 cursor-pointer"
                                    src={assets.prev_icon}
                                    alt="Previous"
                                />
                            </Tippy>
                            {playStatus ? (
                                <Tippy content={t('controls.pause')}>
                                    <img
                                        onClick={pause}
                                        className="w-4 cursor-pointer"
                                        src={assets.pause_icon}
                                        alt="Pause"
                                    />
                                </Tippy>
                            ) : (
                                <Tippy content={t('controls.play')}>
                                    <img
                                        onClick={play}
                                        className="w-4 cursor-pointer"
                                        src={assets.play_icon}
                                        alt="Play"
                                    />
                                </Tippy>
                            )}
                            <Tippy content={t('controls.next')}>
                                <img
                                    onClick={handleNext}
                                    className="w-4 cursor-pointer"
                                    src={assets.next_icon}
                                    alt="Next"
                                />
                            </Tippy>
                            <Tippy content={t('controls.loop')}>
                                <img className="w-4 cursor-pointer" src={assets.loop_icon} alt="Loop" />
                            </Tippy>
                        </div>
                        <div className="flex items-center gap-5">
                            <p>
                                {time.currentTime.minute}:
                                {time.currentTime.second < 10 ? `0${time.currentTime.second}` : time.currentTime.second}
                            </p>
                            <div
                                ref={seekBg}
                                onClick={seekSong}
                                className="w-[60vw] max-w-[500px] bg-gray-300 rounded-full cursor-pointer"
                            >
                                <hr
                                    ref={seekBar}
                                    className="h-1 border-none bg-green-800 rounded-full"
                                    style={{
                                        width: `${
                                            (time.currentTime.second /
                                                (time.totalTime.second + time.totalTime.minute * 60)) *
                                            100
                                        }%`,
                                    }}
                                />
                            </div>
                            <p>
                                {time.totalTime.minute}:
                                {time.totalTime.second < 10 ? `0${time.totalTime.second}` : time.totalTime.second}
                            </p>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-4 opacity-75">
                        <div onClick={playVideo} className="cursor-pointer">
                            <img className="w-4 hover:scale-105" src={assets.plays_icon} alt="Playing View" />
                        </div>
                        <Tippy content={t('queue.lyrics')}>
                            <img className="w-4 cursor-pointer hover:scale-105" src={assets.mic_icon} alt="Lyrics" />
                        </Tippy>
                        <Tippy content={t('queue.queue')}>
                            <img className="w-4 cursor-pointer hover:scale-105" src={assets.queue_icon} alt="Queue" />
                        </Tippy>
                        <Tippy content={t('queue.connect')}>
                            <img
                                className="w-4 cursor-pointer hover:scale-105"
                                src={assets.speaker_icon}
                                alt="Speaker"
                            />
                        </Tippy>
                        {isMuted ? <GoMute onClick={handleMuteClick} /> : <GoUnmute onClick={handleMuteClick} />}
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 bg-white h-1 rounded"
                        />
                        <img className="w-4 cursor-pointer hover:scale-105" src={assets.zoom_icon} alt="Zoom" />
                    </div>
                </div>
            ) : isLoggedIn ? (
                <div className="h-[10%]">
                    <Link to="/">
                        <div className="h-[90%] bg-gradient-custom-player flex justify-between items-center text-white px-4 mx-2">
                            <div>
                                <h1 className="text-[14px] font-bold">{t('preview.title')}</h1>
                                <p className="font-semibold">{t('preview.premium.description')}</p>
                            </div>
                            <div>
                                <button className="mr-2 bg-white text-black px-7 py-3 rounded-full font-bold hover:scale-105 hover:bg-[#f0f0f0]">
                                    {t('preview.premium.button')}
                                </button>
                            </div>
                        </div>
                    </Link>
                </div>
            ) : (
                <div className="h-[10%]">
                    <Link to={config.routes.signup}>
                        <div className="h-[90%] bg-gradient-custom-player flex justify-between items-center text-white px-4 mx-2">
                            <div>
                                <h1 className="text-[14px] font-bold">{t('preview.title')}</h1>
                                <p className="font-semibold">{t('preview.free.description')}</p>
                            </div>
                            <div>
                                <button className="mr-2 bg-white text-black px-7 py-3 rounded-full font-bold hover:scale-105 hover:bg-[#f0f0f0]">
                                    {t('preview.free.button')}
                                </button>
                            </div>
                        </div>
                    </Link>
                </div>
            )}
        </>
    );
}

export default Player;
