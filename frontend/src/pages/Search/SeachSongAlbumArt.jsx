import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchSongsByName } from '@/service/apiService';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faPlay, faPlus } from '@fortawesome/free-solid-svg-icons';
import Footer from '@/layouts/components/Footer';
import { useTranslation } from 'react-i18next';
import { searchAlbum, searchArtist } from '@/service/UserAPI';

const SearchSongAlbumArt = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('keyword') || '';
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsArtist, setSearchResultsArtist] = useState([]);
    const [searchResultsAlbum, setSearchResultsAlbum] = useState([]);
    const { t } = useTranslation();
    const navigate = useNavigate();
    console.log(searchResults);
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
            let resArtist = await searchArtist(searchQuery);
            let resAlbum = await searchAlbum(searchQuery);

            console.log(res);

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
                            duration,
                            id_artist: song.ma_user?.id, // Thêm thời gian bài hát
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
                                        id_artist: song.ma_user?.id,
                                    };
                                }),
                            ),
                        );
                    }
                } else {
                    setSearchResults(formattedData);
                }
            }

            if (resArtist && resArtist.data) {
                setSearchResultsArtist(resArtist.data);
            }

            if (resAlbum && resAlbum.data) {
                setSearchResultsAlbum(resAlbum.data);
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

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    };

    const topResult = searchResults.length > 0 ? searchResults[0] : null;

    return (
        <div className="bg-[#121212] w-full h-full rounded-xl p-4 md:p-6 overflow-y-auto">
            {/* Thanh danh mục */}
            <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                {['All', 'Songs', 'Artists', 'Albums'].map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 
                        ${activeCategory === category ? 'bg-white text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Kết quả hàng đầu */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                {/* Kết quả hàng đầu */}
                <div className="w-full md:flex-1" style={{ flexBasis: '30%' }}>
                    <h1 className="text-white text-xl md:text-2xl font-bold mb-3 md:mb-4">{t('search.topResult')}</h1>
                    <div className="relative flex items-center gap-3 md:gap-4 bg-gray-800 p-3 md:p-4 rounded-lg hover:bg-gray-700 transition duration-200 group cursor-pointer">
                        <img
                            src={topResult?.image}
                            alt={topResult?.title}
                            className="w-16 h-16 md:w-24 md:h-24 rounded-md"
                        />
                        <div>
                            <h2 className="text-white text-lg md:text-xl font-bold group-hover:underline">
                                {topResult?.title}
                            </h2>
                            <p className="text-gray-400 text-xs md:text-sm">
                                <span className="border border-gray-500 px-1 text-xs rounded">{t('search.song')}</span>{' '}
                                • <span className="text-white">{topResult?.artist}</span>
                            </p>
                        </div>
                        <button
                            className="absolute right-3 md:right-4 bg-green-500 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                            onClick={() => {
                                navigate(`/song/${topResult.id}`);
                            }}
                        >
                            <FontAwesomeIcon icon={faPlay} className="text-black text-base md:text-lg" />
                        </button>
                    </div>
                </div>

                {/* Danh sách bài hát */}
                <div className="w-full md:flex-grow" style={{ flexBasis: '70%' }}>
                    <h2 className="text-white text-xl md:text-2xl font-bold mb-3 md:mb-4">{t('search.songs')}</h2>
                    {searchResults.slice(0, 4).map((song) => (
                        <div
                            key={song.id}
                            onClick={() => {
                                navigate(`/song/${song.id}`);
                            }}
                            className="group flex items-center gap-3 md:gap-4 bg-gray-800 p-2 md:p-3 rounded-lg mb-2 hover:bg-gray-700 transition duration-200 cursor-pointer"
                        >
                            <img src={song.image} alt={song.title} className="w-10 h-10 md:w-12 md:h-12 rounded-md" />
                            <div className="flex-grow">
                                <h3 className="text-white text-sm md:text-base font-medium group-hover:underline">
                                    {song.title}
                                </h3>
                                <p className="text-gray-400 text-xs md:text-sm">{song.artist}</p>
                            </div>
                            <span className="text-gray-400 text-xs md:text-sm group-hover:hidden">{song.duration}</span>
                            <div className="hidden group-hover:flex items-center space-x-2 md:space-x-3">
                                <button className="text-white hover:text-green-500">
                                    <FontAwesomeIcon icon={faPlay} className="text-sm md:text-base" />
                                </button>
                                <button className="text-white hover:text-gray-400">
                                    <FontAwesomeIcon icon={faPlus} className="text-sm md:text-base" />
                                </button>
                                <button className="text-white hover:text-gray-400">
                                    <FontAwesomeIcon icon={faEllipsisH} className="text-sm md:text-base" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danh sách nghệ sĩ */}
            {searchResultsArtist.length > 0 && (
                <>
                    <h2 className="text-white text-xl md:text-2xl font-bold mt-4 md:mt-6 mb-3 md:mb-4">
                        {t('search.artists')}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-10 overflow-x-auto pb-2 cursor-pointer">
                        {searchResultsArtist.slice(0, 6).map((artist) => (
                            <div
                                key={artist.id}
                                className="flex flex-col items-center hover:bg-gray-700 transition duration-200 rounded-lg p-2"
                                onClick={() => navigate(`/artist/${artist.id}`)}
                            >
                                <img
                                    src={artist.avatar}
                                    alt={artist.name}
                                    className="w-24 h-24 md:w-40 md:h-40 rounded-full"
                                />
                                <div className="text-center">
                                    <h3 className="text-white text-sm md:text-base font-medium group-hover:underline">
                                        {artist.name}
                                    </h3>
                                    <p className="text-white text-xs md:text-sm mt-1 md:mt-2">{t('search.artist')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Danh sách album */}
            {searchResultsAlbum.length > 0 && (
                <div>
                    <h2 className="text-white text-xl md:text-2xl font-bold mt-4 md:mt-6 mb-3 md:mb-4">
                        {t('search.albums')}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 overflow-x-auto pb-2">
                        {searchResultsAlbum.slice(0, 6).map((album) => (
                            <div
                                key={album.id}
                                className="relative bg-gray-800 p-2 md:p-4 rounded-lg hover:bg-gray-700 transition duration-200 group cursor-pointer"
                                onClick={() => navigate(`/album/${album.id}`)}
                            >
                                <img
                                    src={album.hinh_anh}
                                    alt={album.ten_album}
                                    className="w-full h-32 md:h-40 rounded-md object-cover"
                                />
                                <p className="text-white text-xs md:text-sm mt-2 font-semibold">{album.ten_album}</p>
                                <p className="text-gray-400 text-xs">
                                    {formatDate(album?.ngay_tao)} • {album?.ma_user?.name}
                                </p>
                                <button className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-green-500 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110">
                                    <FontAwesomeIcon icon={faPlay} className="text-black text-sm md:text-lg" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default SearchSongAlbumArt;
