import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaPlay } from 'react-icons/fa';
import { IoMdPause } from 'react-icons/io';
import {
    faArrowUpFromBracket,
    faArrowUpRightFromSquare,
    faBars,
    faCheck,
    faCirclePlus,
    faCircleXmark,
    faEllipsis,
    faFolder,
    faList,
    faPlay,
    faPause,
} from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import TippyHeadless from '@tippyjs/react/headless';
import 'tippy.js/dist/tippy.css';
import { assets } from '@/assets/assets';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { getArtistSong } from '@/service/apiService';
import { setCurrentPlaylist, playWithId, setPlayStatus } from '@/redux/Reducer/playerSlice';
import config from '@/configs';
import Footer from '@/layouts/components/Footer';

function DisplayArtist() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { track, playStatus } = useSelector((state) => state.player);
    const [artistData, setArtistData] = useState(null);
    const [topSongs, setTopSongs] = useState([]);
    const [shortType, setShortType] = useState(false);
    const [target, setTarget] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [hoveredSongId, setHoveredSongId] = useState(null); // Theo dõi bài hát đang hover
    const displayArtistRef = useRef();
    const location = useLocation();
    const isArtist = location.pathname.includes('artist');
    const bgColor = '#4A90E2';
    const navigate = useNavigate();

    const GetArtistSong = async () => {
        try {
            const response = await getArtistSong(id);
            const artist = response.data;
            setTopSongs(artist);
            // Lọc 5 bài hát có lượt nghe cao nhất (giả sử có trường luot_nghe)
            // const sortedSongs = artist.songs
            // .sort((a, b) => (b.luot_nghe || 0) - (a.luot_nghe || 0))
            // .slice(0, 5); // Lấy 5 bài đầu
            // setTopSongs(sortedSongs);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        GetArtistSong();
    }, [id]);

    console.log(topSongs);
    
    useEffect(() => {
        if (isArtist && displayArtistRef.current) {
            displayArtistRef.current.style.background = `linear-gradient(${bgColor}, #121212)`;
        } else if (displayArtistRef.current) {
            displayArtistRef.current.style.background = `#121212`;
        }
    }, [isArtist, bgColor]);

    useEffect(() => {
        if (artistData) {
            document.title = `${artistData.name || 'Artist'} | Spotify`;
        }
    }, [artistData]);

    const handlePlayTopSongs = () => {
        if (topSongs.length > 0) {
            dispatch(setCurrentPlaylist(topSongs));
            dispatch(setPlayStatus(true));
        }
    };

    const handlePlaySong = (songId) => {
        dispatch(playWithId(songId));
    };

    const handlePause = () => {
        dispatch(setPlayStatus(false));
    };

    return (
        <div
            ref={displayArtistRef}
            className="bg-[#121212] w-[79%] h-[97.4%] rounded-xl my-2 mr-2 py-4 overflow-hidden overflow-y-auto"
        >
            <div className="px-6 mt-4 mb-10 flex flex-col md:flex-row md:items-end gap-8">
                <img className="w-48 rounded-full" src={assets.img13} alt="" />
                <div>
                    <p className="text-white mb-2">Nghệ sĩ</p>
                    <h2 className="text-white text-5xl font-extrabold mb-4 md:text-6xl tracking-tight">Đỗ Anh Đài</h2>
                    <p className="text-[#b3b3b3] mt-1 font-medium text-[14px]">1.549 người theo dõi</p>
                </div>
            </div>
            <div className="flex justify-between items-center px-6">
                <div className="flex gap-8">
                    <button
                        className="flex justify-center items-center w-14 h-14 bg-[#1ed760] rounded-[50%] hover:bg-[#3be477] hover:scale-105"
                        onClick={playStatus ? handlePause : handlePlayTopSongs}
                    >
                        {playStatus && topSongs.some((song) => song.id === track?.id) ? (
                            <IoMdPause size={20} />
                        ) : (
                            <FaPlay size={20} />
                        )}
                    </button>
                    <Tippy content="Theo dõi">
                        <button className="text-[#b3b3b3] hover:text-white hover:scale-105">
                            <FontAwesomeIcon icon={faCirclePlus} className="w-8 h-8" />
                        </button>
                    </Tippy>
                    <TippyHeadless
                        interactive
                        visible={hovering || target}
                        placement="bottom-start"
                        render={(attrs) => (
                            <div
                                className="text-white text-[14px] font-semibold bg-[#282828] px-1 py-1 pb-2 mr-1 rounded-md shadow-xl"
                                tabIndex="-1"
                                {...attrs}
                            >
                                {target ? (
                                    <div className="min-w-[296px] h-[90px]">
                                        <button className="flex items-center gap-4 w-full text-[#b3b3b3] py-3 pl-3 pr-2 rounded-[4px] cursor-pointer hover:text-white hover:bg-[#ffffff1a]">
                                            <FontAwesomeIcon icon={faCircleXmark} />
                                            <span>Bỏ theo dõi</span>
                                        </button>
                                        <button className="flex items-center gap-4 w-full text-[#b3b3b3] py-3 pl-3 pr-2 rounded-[4px] cursor-pointer hover:text-white hover:bg-[#ffffff1a]">
                                            <FontAwesomeIcon icon={faFolder} />
                                            <span>Thêm vào thư mục</span>
                                        </button>
                                    </div>
                                ) : (
                                    <span>Các tùy chọn khác</span>
                                )}
                            </div>
                        )}
                    >
                        <button
                            onMouseEnter={() => setHovering(true)}
                            onMouseLeave={() => setHovering(false)}
                            onClick={() => {
                                setTarget(!target);
                                setHovering(false);
                            }}
                        >
                            <FontAwesomeIcon icon={faEllipsis} className="w-6 h-6 text-[#b3b3b3]" />
                        </button>
                    </TippyHeadless>
                </div>
                <div>
                    <TippyHeadless
                        interactive
                        placement="bottom-end"
                        trigger="click"
                        render={(attrs) => (
                            <div
                                className="bg-[#282828] w-40 h-32 p-1 rounded shadow-[0_16px_24px_0_rgba(0,0,0,0.3)]"
                                tabIndex="-1"
                                {...attrs}
                            >
                                <ul>
                                    <li>
                                        <span className="p-3 text-[#b3b3b3] text-[11px] font-bold">Xem dưới dạng</span>
                                    </li>
                                    <li>
                                        <button
                                            className="w-full text-white text-left p-3 pr-2 hover:bg-[#3e3e3e]"
                                            onClick={() => setShortType(true)}
                                        >
                                            {shortType ? (
                                                <>
                                                    <FontAwesomeIcon icon={faBars} className="mr-3 text-[#1fcc5d]" />
                                                    <span className="text-[14px] text-[#1fcc5d]">Rút gọn</span>
                                                    <FontAwesomeIcon icon={faCheck} className="ml-10 text-[#1fcc5d]" />
                                                </>
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faBars} className="mr-3" />
                                                    <span className="text-[14px]">Rút gọn</span>
                                                </>
                                            )}
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="w-full text-white text-left p-3 pr-2 hover:bg-[#3e3e3e]"
                                            onClick={() => setShortType(false)}
                                        >
                                            {shortType ? (
                                                <>
                                                    <FontAwesomeIcon icon={faList} className="mr-3" />
                                                    <span className="text-[14px]">Danh sách</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faList} className="mr-3 text-[#1fcc5d]" />
                                                    <span className="text-[14px] text-[#1fcc5d]">Danh sách</span>
                                                    <FontAwesomeIcon icon={faCheck} className="ml-5 text-[#1fcc5d]" />
                                                </>
                                            )}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    >
                        <div className="flex justify-center items-center gap-3 text-[#b3b3b3] text-[14px] hover:text-white cursor-pointer">
                            <p>Danh sách</p>
                            <FontAwesomeIcon icon={faList} />
                        </div>
                    </TippyHeadless>
                </div>
            </div>
            <h3 className="text-white text-2xl font-bold px-6 mt-6">Phổ biến</h3>
            {topSongs.length > 0 ? (
                <>
                    {shortType ? (
                        <div className="grid grid-cols-2 sm:grid-cols-[1.5fr_1fr_1fr_0.3fr] px-6 mt-4 mb-4 text-[#a7a7a7]">
                            <p className="font-semibold">
                                <b className="mr-4">#</b>Tiêu đề
                            </p>
                            <p className="font-semibold">Album</p>
                            <img className="m-auto w-4" src={assets.clock_icon} alt="" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-[1.7fr_1fr_0.3fr] px-6 mt-4 mb-4 text-[#a7a7a7]">
                            <p className="font-semibold">
                                <b className="mr-4">#</b>Tiêu đề
                            </p>
                            <p className="font-semibold">Album</p>
                            <img className="m-auto w-4" src={assets.clock_icon} alt="" />
                        </div>
                    )}
                    <hr className="mt-[-8px] mb-4 mx-6" />
                    {topSongs.map((item, index) =>
                        shortType ? (
                            <div
                                key={index}
                                onClick={() => navigate(config.routes.detailSong + `/${item.id}`)}
                                onMouseEnter={() => setHoveredSongId(item.id)}
                                onMouseLeave={() => setHoveredSongId(null)}
                                className="grid grid-cols-2 sm:grid-cols-[1.5fr_1fr_1fr_0.3fr] gap-2 p-2 px-6 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
                            >
                                <div className="flex items-center">
                                    <div
                                        className="mr-4 w-5 h-5 flex items-center justify-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (playStatus && track?.id === item.id) {
                                                handlePause();
                                            } else {
                                                handlePlaySong(item.id);
                                            }
                                        }}
                                    >
                                        {hoveredSongId === item.id ? (
                                            playStatus && track?.id === item.id ? (
                                                <IoMdPause size={16} className="text-white" />
                                            ) : (
                                                <FaPlay size={14} className="text-white" />
                                            )
                                        ) : (
                                            <b>{index + 1}</b>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{item.ten_bai_hat}</p>
                                    </div>
                                </div>
                                <div className="text-[15px] font-semibold">
                                    <p>{item.albums}</p>
                                </div>
                                <div className="text-center">
                                    <p>4:12</p>
                                </div>
                            </div>
                        ) : (
                            <div
                                key={index}
                                onClick={() => navigate(config.routes.detailSong + `/${item.id}`)}
                                onMouseEnter={() => setHoveredSongId(item.id)}
                                onMouseLeave={() => setHoveredSongId(null)}
                                className="grid grid-cols-2 sm:grid-cols-[1.7fr_1fr_0.3fr] gap-2 p-2 px-6 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
                            >
                                <div className="flex items-center">
                                    <div
                                        className="mr-4 w-5 h-5 flex items-center justify-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (playStatus && track?.id === item.id) {
                                                handlePause();
                                            } else {
                                                handlePlaySong(item.id);
                                            }
                                        }}
                                    >
                                        {hoveredSongId === item.id ? (
                                            playStatus && track?.id === item.id ? (
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
                                    </div>
                                </div>
                                <div className="text-[15px] font-semibold">
                                    <p>{item.albums}</p>
                                </div>
                                <div className="text-center">
                                    <p>4:12</p>
                                </div>
                            </div>
                        ),
                    )}
                </>
            ) : (
                <div className="flex justify-center items-center h-[200px]">
                    <p className="text-white text-sm font-semibold">Nghệ sĩ này chưa có bài hát nào</p>
                </div>
            )}
            <Footer />
        </div>
    );
}

export default DisplayArtist;