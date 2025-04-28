import { assets } from '@/assets/assets';
import {
    getSongById,
    getAllPlaylist,
    addLikeSong,
    addSongToPlaylist,
    getSongPlaylist,
    createNewPlaylist,
} from '@/service/apiService';
import React, { useEffect, useRef, useState } from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';
import { BsPlusLg } from 'react-icons/bs';
import { useLocation, useParams } from 'react-router-dom';
import { FaHeart, FaPlay, FaRegHeart } from 'react-icons/fa';
import { formatDate } from '@/Utils';
import { IoMdMore, IoMdPause } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSongDetails, playWithId, setPlayStatus } from '@/redux/Reducer/playerSlice';
import { setPlaylists } from '@/redux/Reducer/playlistSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import TippyHeadless from '@tippyjs/react/headless';
import Footer from '@/layouts/components/Footer';

const DisplayDetaiSong = () => {
    const dispatch = useDispatch();
    const { playStatus, track } = useSelector((state) => state.player);
    const playlists = useSelector((state) => state.playlist.playlists);

    const [songData, setSongData] = useState({});
    const [isLiked, setIsLiked] = useState(false);
    const [target, setTarget] = useState(false);
    const [hovering, setHovering] = useState(false);
    const { id } = useParams();

    const displaySongRef = useRef();
    const bgColor = '#009933';
    const location = useLocation();
    const isSong = location.pathname.includes('song');

    useEffect(() => {
        const fetchData = async () => {
            await getDetailSong();
            await fetchPlaylists();
        };
        fetchData();
    }, [id]);

    const getDetailSong = async () => {
        try {
            const response = await getSongById(id);
            setSongData(response.data);
            setIsLiked(response.data.isLiked || false);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết bài hát:', error);
        }
    };

    const fetchPlaylists = async () => {
        try {
            const response = await getAllPlaylist();
            dispatch(setPlaylists(response.data)); // Cập nhật Redux store
        } catch (error) {
            console.error('Lỗi khi lấy danh sách playlist:', error);
        }
    };

    useEffect(() => {
        if (isSong && displaySongRef.current) {
            displaySongRef.current.style.background = `linear-gradient(${bgColor}, #121212)`;
        } else if (displaySongRef.current) {
            displaySongRef.current.style.background = `#121212`;
        }
    }, [isSong, bgColor]);

    const handlePlay = async () => {
        if (songData?.id) {
            await dispatch(fetchSongDetails(songData.id));
            dispatch(playWithId(songData.id));
        }
    };

    const handlePause = () => {
        dispatch(setPlayStatus(false));
    };

    const handleLikeSong = async () => {
        try {
            await addLikeSong({ ma_bai_hat: songData.id });
            setIsLiked(true);
            setTarget(false);
        } catch (error) {
            console.error('Lỗi khi thêm bài hát vào danh sách yêu thích:', error);
            setTarget(false);
        }
    };

    const handleAddToPlaylist = async (playlistId) => {
        try {
            const playlistSongs = await getSongPlaylist(playlistId);
            // const songExists = playlistSongs.data.some((song) => song.id === songData.id);
            // if (songExists) {
            //     return;
            // }
            await addSongToPlaylist({ ma_playlist: playlistId, ma_bai_hat: songData.id });
            setTarget(false);
        } catch (error) {
            console.error('Lỗi khi thêm bài hát vào playlist:', error);
            setTarget(false);
        }
    };

    const handleCreateAndAddToPlaylist = async () => {
        try {
            const response = await createNewPlaylist();
            const newPlaylist = response.data;
            const newPlaylistId = newPlaylist.ma_playlist || newPlaylist.id;
            await addSongToPlaylist({ ma_playlist: newPlaylistId, ma_bai_hat: songData.id });
            setTarget(false);
            // Thêm playlist mới trực tiếp vào Redux store mà không gọi lại API
            dispatch(setPlaylists([...playlists, newPlaylist]));
        } catch (error) {
            console.error('Lỗi khi tạo playlist và thêm bài hát:', error);
            setTarget(false);
        }
    };

    return (
        <div
            ref={displaySongRef}
            className="bg-[#121212] w-[79%] h-[97.4%] rounded-xl my-2 mr-2 overflow-hidden overflow-y-auto"
        >
            <div className="mt-10 flex flex-col md:flex-row md:items-end gap-8 px-6">
                <img className="w-48 h-48 rounded object-cover" src={songData.hinh_anh} alt="" />
                <div className="flex flex-col justify-center">
                    <p className="text-[#ffffff]">Bài hát</p>
                    <h2 className="text-4xl text-[#ffffff] font-bold mb-4 md:text-7xl">{songData.ten_bai_hat}</h2>
                    <p className="mt-1 flex items-center">
                        <img className="w-5" src={assets.spotify_logo} alt="" />
                        <span className="pl-2 font-bold">{songData.ma_user?.name} -</span>
                        <span className="pl-2">{songData.like_count} yêu thích - </span>
                        <span className="pl-2">{songData.luot_nghe} lượt nghe - </span>
                        <span className="pl-2">{formatDate(songData.ngay_phat_hanh)}</span>
                    </p>
                </div>
            </div>
            <div className="px-6">
                <div className="mt-10">
                    <div className="flex gap-10 items-center">
                        <button className="w-[60px] h-[60px] rounded-full bg-[#1ed760] flex justify-center items-center">
                            {playStatus && track?.id === songData.id ? (
                                <IoMdPause onClick={handlePause} size={20} />
                            ) : (
                                <FaPlay onClick={handlePlay} size={20} />
                            )}
                        </button>
                        <TippyHeadless
                            interactive
                            visible={target}
                            placement="bottom-start"
                            onClickOutside={() => setTarget(false)}
                            render={(attrs) => (
                                <div
                                    className="text-white text-[14px] font-semibold bg-[#282828] px-1 py-1 pb-2 rounded-md shadow-xl"
                                    tabIndex="-1"
                                    {...attrs}
                                >
                                    <button
                                        className="flex items-center gap-4 w-full text-[#b3b3b3] py-3 pl-3 pr-2 rounded-[4px] cursor-pointer hover:text-white hover:bg-[#ffffff1a]"
                                        onClick={handleLikeSong}
                                    >
                                        <FontAwesomeIcon icon={faCirclePlus} />
                                        <span>Thêm vào danh sách yêu thích</span>
                                    </button>
                                    <TippyHeadless
                                        interactive
                                        placement="right-start"
                                        render={(subAttrs) => (
                                            <div
                                                className="bg-[#282828] text-white text-[14px] font-semibold px-1 py-2 rounded-md shadow-xl"
                                                tabIndex="-1"
                                                {...subAttrs}
                                            >
                                                <button
                                                    className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[#ffffff1a]"
                                                    onClick={handleCreateAndAddToPlaylist}
                                                >
                                                    <BsPlusLg size={16} />
                                                    <span>Tạo playlist mới</span>
                                                </button>
                                                <hr className="my-1 border-gray-600" />
                                                {playlists.map((playlist) => (
                                                    <button
                                                        key={playlist.ma_playlist}
                                                        className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[#ffffff1a]"
                                                        onClick={() => handleAddToPlaylist(playlist.ma_playlist)}
                                                    >
                                                        <span>{playlist.ten_playlist || playlist.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    >
                                        <button className="flex items-center gap-4 w-full text-[#b3b3b3] py-3 pl-3 pr-2 rounded-[4px] cursor-pointer hover:text-white hover:bg-[#ffffff1a]">
                                            <FontAwesomeIcon icon={faCirclePlus} />
                                            <span>Thêm vào playlist</span>
                                        </button>
                                    </TippyHeadless>
                                </div>
                            )}
                        >
                            <Tippy content="Thêm">
                                <button
                                    className="text-[#b3b3b3] hover:text-white hover:scale-105"
                                    onClick={() => setTarget(!target)}
                                >
                                    <FontAwesomeIcon icon={faCirclePlus} className="w-8 h-8" />
                                </button>
                            </Tippy>
                        </TippyHeadless>
                    </div>
                </div>
            </div>
            <div className="mt-10 flex flex-col gap-5 px-6">
                <div className="flex items-center">
                    <img className="rounded-full h-[60px] w-[60px] text-[#fff] object-cover" src={songData.hinh_anh} alt="" />
                    <div className="ml-5 flex flex-col">
                        <h6 className="text-white">Nghệ sĩ</h6>
                        <b className="uppercase text-[#ffffff]">{songData.ma_user?.name}</b>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DisplayDetaiSong;
