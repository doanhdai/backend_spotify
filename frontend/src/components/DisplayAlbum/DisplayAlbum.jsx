import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import config from '@/configs';
import { assets } from '@/assets/assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlay } from 'react-icons/fa';
import { IoMdMore, IoMdPause } from 'react-icons/io';
import {
    faArrowUpFromBracket,
    faBars,
    faCheck,
    faCirclePlus,
    faCircleXmark,
    faEllipsis,
    faFolder,
    faList,
} from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import TippyHeadless from '@tippyjs/react/headless';
import { getAlbum, getAlbumById, getAllPlaylist, addSongToPlaylist } from '@/service/apiService';
import { setCurrentPlaylist, playWithId, setPlayStatus } from '@/redux/Reducer/playerSlice';
import Footer from '@/layouts/components/Footer';

function DisplayAlbum() {
    const dispatch = useDispatch();
    const { track, playStatus, currentPlaylist } = useSelector((state) => state.player);
    const { id } = useParams();

    const [albumData, setAlbumData] = useState([]);
    const [songsAlbum, setSongsAlbum] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [target, setTarget] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [shortType, setShortType] = useState(false);
    const [hoveredSongId, setHoveredSongId] = useState(null);
    const [menuSongId, setMenuSongId] = useState(null);
    const displayAlbumRef = useRef();
    const location = useLocation();
    const isAlbum = location.pathname.includes('album');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                const albumDetail = await getAlbumById(id);
                setAlbumData(albumDetail.data.album);
                setSongsAlbum(albumDetail.data.songs);
                console.log(albumDetail.data.songs);
            } else {
                const albums = await getAlbum();
                setAlbumData(albums.data);
            }
            const playlistData = await getAllPlaylist();
            if (playlistData) setPlaylists(playlistData.data);
        };
        fetchData();
    }, [id]);

    const handlePlayAlbum = () => {
        if (songsAlbum && songsAlbum.length > 0) {
            dispatch(setPlayStatus(false));
            dispatch(setCurrentPlaylist(songsAlbum));
            setTimeout(() => {
                dispatch(setPlayStatus(true));
            }, 0);
        }
    };

    const handlePlaySong = (songId) => {
        dispatch(playWithId(songId));
    };

    const handlePause = () => {
        dispatch(setPlayStatus(false));
    };

    const handleAddToPlaylist = async (songId, playlistId) => {
        try {
            await addSongToPlaylist({ ma_playlist: playlistId, ma_bai_hat: songId });
            console.log('Added song to playlist!');
        } catch (error) {
            console.error('Failed to add song to playlist:', error);
        }
    };

    const bgColor = '#21115f';

    useEffect(() => {
        if (isAlbum && displayAlbumRef.current) {
            displayAlbumRef.current.style.background = `linear-gradient(${bgColor}, #121212)`;
        } else if (displayAlbumRef.current) {
            displayAlbumRef.current.style.background = `#121212`;
        }
    }, [isAlbum, bgColor]);

    useEffect(() => {
        if (albumData) {
            document.title = `${albumData.ten_album || 'Album'} | Spotify`;
        }
    }, [albumData]);

    const isCurrentPlaylist = () => {
        if (!currentPlaylist || !songsAlbum) return false;
        return (
            currentPlaylist.length === songsAlbum.length &&
            currentPlaylist.every((song, index) => song.id === songsAlbum[index].id)
        );
    };

    return isAlbum ? (
        <div
            ref={displayAlbumRef}
            className={`bg-[#121212] w-[79%] h-[97.4%] rounded-xl my-2 mr-2 py-4 ${
                target ? 'overflow-hidden' : 'overflow-y-auto'
            }`}
        >
            <div className="px-6 mt-4 mb-9 flex flex-col md:flex-row md:items-end gap-8">
                <img className="w-48 rounded" src={albumData.hinh_anh} alt="" />
                <div>
                    <p className="text-white mb-2">Album</p>
                    <h2 className="text-white text-5xl font-extrabold mb-4 md:text-6xl tracking-tight">
                        {albumData.ten_album}
                    </h2>
                    <h4 className="text-[#b3b3b3] font-medium">{albumData.mo_ta}</h4>
                    <p className="text-[#b3b3b3] mt-1 font-medium text-[14px]">
                        <img className="inline-block w-5" src={assets.spotify_logo} alt="" />
                        <b className="text-white text-[14px]"> Spotify </b>• {albumData.songs?.length || 0} bài hát
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center px-6">
                <div className="flex gap-8">
                    <button
                        className="flex justify-center items-center w-14 h-14 bg-[#1ed760] rounded-[50%] hover:bg-[#3be477] hover:scale-105"
                        onClick={playStatus && isCurrentPlaylist() ? handlePause : handlePlayAlbum}
                    >
                        {playStatus && isCurrentPlaylist() && songsAlbum?.some((song) => song.id === track?.id) ? (
                            <IoMdPause size={20} />
                        ) : (
                            <FaPlay size={20} />
                        )}
                    </button>
                </div>
            </div>

            {/* Tiêu đề cột */}
            {songsAlbum.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-[1.7fr_1fr_0.3fr_0.2fr] px-6 mt-10 mb-4 text-[#a7a7a7]">
                        <p className="font-semibold">
                            <b className="mr-4">#</b>Tiêu đề
                        </p>
                        <p className="font-semibold">Nghệ sĩ</p>
                        <img className="m-auto w-4" src={assets.clock_icon} alt="" />
                        <span></span>
                    </div>
                    <hr className="mt-[-8px] mb-4 mx-6" />

                    {/* Danh sách bài hát */}
                    {songsAlbum.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(config.routes.detailSong + `/${item.id}`)}
                            onMouseEnter={() => setHoveredSongId(item.id)}
                            onMouseLeave={() => setHoveredSongId(null)}
                            className="grid grid-cols-2 sm:grid-cols-[1.7fr_1fr_0.3fr_0.2fr] gap-2 p-2 px-6 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
                        >
                            <div className="flex items-center">
                                <div
                                    className="mr-4 w-5 h-5 flex items-center justify-center"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (playStatus && isCurrentPlaylist() && track?.id === item.id) {
                                            handlePause();
                                        } else {
                                            handlePlaySong(item.id);
                                        }
                                    }}
                                >
                                    {hoveredSongId === item.id ? (
                                        playStatus && isCurrentPlaylist() && track?.id === item.id ? (
                                            <IoMdPause size={16} className="text-white" />
                                        ) : (
                                            <FaPlay size={14} className="text-white" />
                                        )
                                    ) : (
                                        <b>{index + 1}</b>
                                    )}
                                </div>
                                <img className="inline w-10 mr-5" src={item.hinh_anh} alt="" />
                                <div>
                                    <p className="text-white font-semibold">{item.ten_bai_hat}</p>
                                    <p className="text-[14px] font-semibold">{item.ma_user?.name}</p>
                                </div>
                            </div>
                            <div className="text-[15px] font-semibold">
                                <p>{item.ma_user?.name}</p>
                            </div>
                            <div className="text-center">
                                <p>4:12</p>
                            </div>
                            <div className="text-center">
                                {hoveredSongId === item.id && (
                                    <TippyHeadless
                                        interactive
                                        visible={menuSongId === item.id}
                                        placement="bottom-end"
                                        appendTo={() => document.body}
                                        render={(attrs) => (
                                            <div
                                                className="bg-[#282828] text-white text-[14px] font-semibold px-1 py-2 rounded-md shadow-xl"
                                                tabIndex="-1"
                                                {...attrs}
                                            >
                                                <TippyHeadless
                                                    interactive
                                                    placement="left"
                                                    appendTo={() => document.body}
                                                    render={(subAttrs) => (
                                                        <div
                                                            className="bg-[#282828] text-white text-[14px] font-semibold px-1 py-2 rounded-md shadow-xl min-w-[200px]"
                                                            tabIndex="-1"
                                                            {...subAttrs}
                                                        >
                                                            {playlists.map((playlist) => (
                                                                <button
                                                                    key={playlist.ma_playlist}
                                                                    className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[#ffffff1a]"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleAddToPlaylist(
                                                                            item.id,
                                                                            playlist.ma_playlist,
                                                                        );
                                                                        setMenuSongId(null);
                                                                    }}
                                                                >
                                                                    <span>{playlist.ten_playlist}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                >
                                                    <button className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[#ffffff1a]">
                                                        <FontAwesomeIcon icon={faFolder} />
                                                        <span>Thêm vào playlist</span>
                                                    </button>
                                                </TippyHeadless>
                                            </div>
                                        )}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuSongId(menuSongId === item.id ? null : item.id);
                                            }}
                                        >
                                            <IoMdMore size={20} className="text-white" />
                                        </button>
                                    </TippyHeadless>
                                )}
                            </div>
                        </div>
                    ))}
                </>
            ) : (
                <div className="flex justify-center items-center h-[200px]">
                    <p className="text-white text-sm font-semibold">Không có bài hát nào trong album</p>
                </div>
            )}
            <Footer />
        </div>
    ) : null;
}

export default DisplayAlbum;
