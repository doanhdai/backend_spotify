import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchSongsByName } from '@/service/apiService';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faPlay, faPlus } from '@fortawesome/free-solid-svg-icons';
import Footer from '@/layouts/components/Footer';
import { useTranslation } from 'react-i18next';

const SearchSongAlbumArt = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('keyword') || '';
    const [searchResults, setSearchResults] = useState([]);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        track,
        playStatus,
        time,
        volume: reduxVolume,
        currentIndex,
        currentPlaylist,
    } = useSelector((state) => state.player);
    const seekBg = useRef();
    const seekBar = useRef();
    useEffect(() => {
        if (seekBar.current && time.totalTime.second >= 0 && time.totalTime.minute >= 0) {
            const totalSeconds = time.totalTime.minute * 60 + time.totalTime.second;
            const currentSeconds = time.currentTime.minute * 60 + time.currentTime.second;
            const width = totalSeconds > 0 ? (currentSeconds / totalSeconds) * 100 : 0;
            seekBar.current.style.width = `${width}%`;
        }
    }, [time]);

    useEffect(() => {
        document.title = 'Spotify - Tìm kiếm';

        if (searchQuery.trim() === '') {
            navigate('/category');
        }
        fetchData();
    }, [searchQuery]);

    const fetchData = async () => {
        try {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            let res = await searchSongsByName(searchQuery);

            if (res && res.data) {
                let resData = res.data;

                const fetchDuration = async (audioUrl) => {
                    return new Promise((resolve) => {
                        const audio = new Audio(audioUrl);
                        audio.addEventListener('loadedmetadata', () => {
                            const duration = Math.floor(audio.duration); // Lấy thời gian bằng giây
                            resolve(formatTime(duration));
                        });
                        audio.addEventListener('error', () => resolve('00:00')); // Nếu lỗi, trả về 00:00
                    });
                };

                const formattedData = await Promise.all(
                    resData.map(async (song) => {
                        const duration = await fetchDuration(song.audio);
                        return {
                            id: song.id,
                            title: song.ten_bai_hat,
                            artist: song.ma_user.name,
                            album: song.ma_album ? song.ma_album.ten_album : 'Unknown Album',
                            genre: song.ma_the_loai?.ten_the_loai,
                            image: song.hinh_anh,
                            audio: song.audio,
                            listens: song.luot_nghe,
                            releaseDate: song.ngay_phat_hanh,
                            duration, // Thêm thời gian bài hát
                        };
                    }),
                );

                if (formattedData.length === 0) {
                    const allSongsRes = await searchSongsByName('');
                    if (allSongsRes && allSongsRes.data) {
                        setSearchResults(
                            await Promise.all(
                                allSongsRes.data.map(async (song) => {
                                    const duration = await fetchDuration(song.audio);
                                    return {
                                        id: song.id,
                                        title: song.ten_bai_hat,
                                        artist: song.ma_user.name,
                                        album: song.ma_album ? song.ma_album.ten_album : 'Unknown Album',
                                        genre: song.ma_the_loai?.ten_the_loai,
                                        image: song.hinh_anh,
                                        audio: song.audio,
                                        listens: song.luot_nghe,
                                        releaseDate: song.ngay_phat_hanh,
                                        duration,
                                    };
                                }),
                            ),
                        );
                    }
                } else {
                    setSearchResults(formattedData);
                }
            }
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    };

    // Hàm định dạng thời gian từ giây thành mm:ss
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const topResult = searchResults.length > 0 ? searchResults[0] : null;
    console.log(topResult);
    return (
        <div className="bg-[#121212] w-full h-full rounded-xl p-6 overflow-y-auto">
            {/* Thanh danh mục */}
            <div className="flex gap-3 mb-6">
                {['All', 'Songs', 'Artists', 'Albums'].map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 
                        ${activeCategory === category ? 'bg-white text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Kết quả hàng đầu */}
            <div className="flex gap-8">
                {/* Kết quả hàng đầu */}
                <div className="flex-1 " style={{ flexBasis: '30%' }}>
                    <h1 className="text-white text-2xl font-bold mb-4">{t('search.topResult')}</h1>
                    <div className="relative flex items-center gap-4 bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-200 group cursor-pointer">
                        <img src={topResult?.image} alt={topResult?.title} className="w-24 h-24 rounded-md" />
                        <div>
                            <h2 className="text-white text-xl font-bold group-hover:underline">{topResult?.title}</h2>
                            <p className="text-gray-400">
                                <span className="border border-gray-500 px-1 text-xs rounded">{t('search.song')}</span>{' '}
                                • <span className="text-white">{topResult?.artist}</span>
                            </p>
                        </div>
                        <button
                            className="absolute right-4 bg-green-500 w-12 h-12 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                            onClick={() => {
                                navigate(`/song/${topResult.id}`);
                            }}
                        >
                            <FontAwesomeIcon icon={faPlay} className="text-black text-lg" />
                        </button>
                    </div>
                </div>

                {/* Danh sách bài hát */}
                <div className="flex-grow" style={{ flexBasis: '70%' }}>
                    <h2 className="text-white text-2xl font-bold mb-4">{t('search.songs')}</h2>
                    {searchResults.slice(0, 4).map(
                        (
                            song, // Chỉ lấy tối đa 4 bài hát
                        ) => (
                            <div
                                key={song.id}
                                onClick={() => {
                                    navigate(`/song/${song.id}`);
                                }}
                                className="group flex items-center gap-4 bg-gray-800 p-3 rounded-lg mb-2 hover:bg-gray-700 transition duration-200 cursor-pointer"
                            >
                                <img src={song.image} alt={song.title} className="w-12 h-12 rounded-md" />
                                <div className="flex-grow">
                                    <h3 className="text-white font-medium group-hover:underline">{song.title}</h3>
                                    <p className="text-gray-400 text-sm">{song.artist}</p>
                                </div>
                                <span className="text-gray-400 group-hover:hidden">{song.duration}</span>
                                <div className="hidden group-hover:flex items-center space-x-3">
                                    <button className="text-white hover:text-green-500">
                                        <FontAwesomeIcon icon={faPlay} />
                                    </button>
                                    <button className="text-white hover:text-gray-400">
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                    <button className="text-white hover:text-gray-400">
                                        <FontAwesomeIcon icon={faEllipsisH} />
                                    </button>
                                </div>
                            </div>
                        ),
                    )}
                </div>
            </div>
            {/* Danh sách nghệ sĩ */}
            <h2 className="text-white text-2xl font-bold mt-6 mb-4">{t('search.artists')}</h2>
            <div className="flex gap-10 overflow-x-auto pb-2 cursor-pointer">
                {searchResults.slice(0, 6).map((artist) => (
                    <div
                        key={artist.id}
                        className="flex flex-col  hover:bg-gray-700 transition duration-200 rounded-lg p-2"
                    >
                        <img src={artist.image} alt={artist.artist} className="w-40 h-40 rounded-full" />
                        <div>
                            <h3 className="text-white font-medium group-hover:underline">{artist.artist}</h3>
                            <p className="text-white text-sm mt-2">{t('search.artist')}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Danh sách album */}
            <div>
                <h2 className="text-white text-2xl font-bold mt-6 mb-4">{t('search.albums')}</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {searchResults.slice(0, 6).map((album) => (
                        <div
                            key={album.id}
                            className="relative bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-200 group cursor-pointer w-45 h-45"
                        >
                            <img src={album.image} alt={album.album} className="w-full h-40 rounded-md object-cover" />
                            <p className="text-white text-sm mt-2 font-semibold">{album.album}</p>
                            <p className="text-gray-400 text-xs">
                                {album.year} • {album.artist}
                            </p>
                            <button
                                className="absolute bottom-4 right-4 bg-green-500 w-10 h-10 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                                onClick={() => navigate(`/album/${album.id}`)}
                            >
                                <FontAwesomeIcon icon={faPlay} className="text-black text-lg" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SearchSongAlbumArt;
