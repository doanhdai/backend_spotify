import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayList from '@/components/PlayList';
import Artist from '@/components/Artist';
import Item from '@/components/Item';

import { assets } from '@/assets/assets';
import Footer from '@/layouts/components/Footer';
import { useSelector } from 'react-redux';
import { getAlbum, getAllArtist, getAllSongs } from '@/service/apiService';
import Album from '@/components/Album';
import { useTranslation } from 'react-i18next';

function Home() {
    const scrollHomeRef = useRef();
    const topRef = useRef();
    const bgHomeHeader = useRef();
    const navigate = useNavigate();
    const [all, setAll] = useState(true);
    const [artists, setArtists] = useState([]);
    const [music, setMusic] = useState(false);
    const [album, setAlbum] = useState([]);
    const [podcasts, setPodcasts] = useState(false);
    const [songs, setSongs] = useState([]);
    const { t } = useTranslation();

    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const handlerScroll = () => {
        if (scrollHomeRef.current.scrollTop > 0) {
            bgHomeHeader.current.style.background = '';
        } else {
            bgHomeHeader.current.style.background = '';
        }
    };
    const fetchArtists = async () => {
        try {
            const response = await getAllArtist();
            setArtists(response.data);
        } catch (error) {
            console.log('Lỗi khi tải dữ liệu nghệ sĩ!');
            console.error(error);
        }
    };
    const fetchAllSongs = async () => {
        try {
            const response = await getAllSongs();
            setSongs(response.data);
        } catch (error) {
            console.log('Lỗi khi tải dữ liệu bài hát!');
            console.error(error);
        }
    };

    const fetchAlbum = async () => {
        try {
            const response = await getAlbum();
            setAlbum(response.data);
            console.log(response.data);
        } catch (error) {
            console.log('Lỗi khi tải dữ liệu album!');
            console.error(error);
        }
    };
    useEffect(() => {
        fetchArtists();
        fetchAllSongs();
        fetchAlbum();
    }, []);

    useEffect(() => {
        document.title = 'Spotify - Web Player: Music for everyone';
    }, []);
    const playlistsData = [
        {
            _id: '1',
            image: 'https://source.unsplash.com/200x200/?music,playlist',
            name: 'Chill Vibes',
            desc: 'Thư giãn với những giai điệu nhẹ nhàng.',
        },
        {
            _id: '2',
            image: 'https://source.unsplash.com/200x200/?pop,music',
            name: 'Top Hits',
            desc: 'Những bài hát hot nhất hiện nay.',
        },
        {
            _id: '3',
            image: 'https://source.unsplash.com/200x200/?rock,concert',
            name: 'Rock Legends',
            desc: 'Những bản rock bất hủ theo năm tháng.',
        },
        {
            _id: '4',
            image: 'https://source.unsplash.com/200x200/?jazz,music',
            name: 'Jazz & Blues',
            desc: 'Hòa mình vào giai điệu Jazz và Blues.',
        },
        {
            _id: '5',
            image: 'https://source.unsplash.com/200x200/?edm,dj',
            name: 'EDM Party',
            desc: 'Nhạc EDM sôi động cho bữa tiệc của bạn.',
        },
        {
            _id: '6',
            image: 'https://source.unsplash.com/200x200/?relax,music',
            name: 'Lo-Fi Chill',
            desc: 'Nhạc Lo-Fi giúp bạn tập trung và thư giãn.',
        },
        {
            _id: '7',
            image: 'https://source.unsplash.com/200x200/?hiphop,rap',
            name: 'Hip-Hop Bangers',
            desc: 'Những bản rap đình đám nhất hiện nay.',
        },
        {
            _id: '8',
            image: 'https://source.unsplash.com/200x200/?acoustic,guitar',
            name: 'Acoustic Love',
            desc: 'Giai điệu nhẹ nhàng từ guitar acoustic.',
        },
    ];
    return (
        <>
            <div
                ref={scrollHomeRef}
                onScroll={handlerScroll}
                className={`${
                    isLoggedIn ? 'bg-gradient-custom-home' : 'bg-[#121212]'
                } w-[79%] h-[97.4%] rounded-xl my-2 mr-2 py-4 pt-0 overflow-hidden overflow-y-auto`}
            >
                <div ref={topRef}></div>
                {isLoggedIn ? (
                    <div
                        ref={bgHomeHeader}
                        className="flex items-center w-full gap-2 px-6 py-4 rounded-t-xl font-medium bg-transparent top-0 z-10"
                    >
                        <p
                            className={` ${
                                all ? 'bg-white text-black' : 'bg-[#382a6c] text-white hover:bg-[#3f3371]'
                            }  px-4 py-1 rounded-2xl cursor-pointer`}
                            onClick={() => {
                                setAll(true);
                                setMusic(false);
                                setPodcasts(false);
                                topRef.current.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {t('home.all')}
                        </p>
                        <p
                            className={`${
                                music
                                    ? 'bg-white text-black hover:bg-none'
                                    : 'bg-[#382a6c] text-white hover:bg-[#3f3371]'
                            } px-4 py-1 rounded-2xl  transition-colors duration-200 cursor-pointer`}
                            onClick={() => {
                                setMusic(true);
                                setAll(false);
                                setPodcasts(false);
                                topRef.current.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {t('home.music')}
                        </p>
                        {/* <p
                            className={`${
                                podcasts
                                    ? 'bg-white text-black hover:bg-none'
                                    : 'bg-[#382a6c] text-white hover:bg-[#3f3371]'
                            } px-4 py-1 rounded-2xl  transition-colors duration-200 cursor-pointer`}
                            onClick={() => {
                                setPodcasts(true);
                                setAll(false);
                                setMusic(false);
                                topRef.current.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Podcasts
                        </p> */}
                    </div>
                ) : null}

                {isLoggedIn ? (
                    <div className="flex px-6 py-4">
                        <div className="flex items-center w-96  cursor-pointer" onClick={() => navigate('/likedSongs')}>
                            <img className="w-14 rounded-tl-[4px] rounded-bl-[4px]" src={assets.liked_songs} alt="" />
                            <div className="bg-[#33295c] px-4 py-4 w-full rounded-tr-[4px] rounded-br-[4px] -hover:bg-[#fff3] transition-colors duration-300">
                                <h4 className="text-white font-semibold">{t('home.likedSongs')}</h4>
                            </div>
                        </div>
                        <div className="flex items-center w-96 ml-6  cursor-pointer">
                            <img
                                className="w-14 rounded-tl-[4px] rounded-bl-[4px]"
                                src={assets.NgayEmDepNhatRadio}
                                alt=""
                            />
                            <div className="bg-[#33295c] px-4 py-4 w-full rounded-tr-[4px] rounded-br-[4px] -hover:bg-[#fff3] transition-colors duration-300">
                                <h4 className="text-white font-semibold">Ngày em đẹp nhất </h4>
                            </div>
                        </div>
                    </div>
                ) : null}

                {isLoggedIn ? (
                    <div className="px-6 mb-4 mt-8">
                        <div className="flex items-center justify-between text-white mb-2">
                            <h1 className=" font-bold text-2xl hover:underline cursor-pointer">
                                {t('home.popularSongs')}
                            </h1>
                            {songs.length > 7 ? (
                                <p className="text-[14px] font-bold hover:underline cursor-pointer mr-7">
                                    {t('home.showAll')}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {songs.map((item, index) => (
                                <Item
                                    key={index}
                                    id={item.id}
                                    image={item.hinh_anh}
                                    name={item.ten_bai_hat}
                                    artist={item.ma_user.name}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="px-6 mb-4 mt-8">
                        <div className="flex items-center justify-between text-white mb-2">
                            <h1 className=" font-bold text-2xl hover:underline cursor-pointer">
                                {t('home.forYou', { name: localStorage.getItem('name_user') })}
                            </h1>
                            {songs.length > 7 ? (
                                <p className="text-[14px] font-bold hover:underline cursor-pointer mr-7">
                                    {t('home.showAll')}
                                </p>
                            ) : null}
                        </div>
                        <div className="flex overflow-auto space-x-2 ml-[-6px]">
                            {songs.slice(0, 7).map((item, index) => (
                                <PlayList
                                    key={index}
                                    id={item.id}
                                    image={item.hinh_anh}
                                    name={item.ten_bai_hat}
                                    artist={item.ma_user.name}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="px-6 mb-4 mt-8">
                    <div className="flex items-center justify-between text-white mb-2">
                        <h1 className=" font-bold text-2xl hover:underline cursor-pointer">
                            {isLoggedIn ? `${t('home.favoriteArtists')}` : `${t('home.popularArtists')}`}
                        </h1>
                        {artists.length > 7 ? (
                            <p className="text-[14px] font-bold hover:underline cursor-pointer mr-7">
                                {t('home.showAll')}
                            </p>
                        ) : null}
                    </div>
                    <div className="flex overflow-auto space-x-2 ml-[-6px]">
                        {isLoggedIn
                            ? artists
                                  .slice(0, 7)
                                  .map((item, index) => (
                                      <Artist key={index} id={item.id} image={assets.img13} name={item.name} />
                                  ))
                            : artists
                                  .slice(0, 7)
                                  .map((item, index) => (
                                      <Artist
                                          key={index}
                                          id={item.id}
                                          image={assets.img7}
                                          name={item.name}
                                          desc={item.desc}
                                      />
                                  ))}
                    </div>
                </div>

                {isLoggedIn ? (
                    <div className="px-6 mb-4 mt-8">
                        <div className="flex items-center justify-between text-white mb-2">
                            <h1 className=" font-bold text-2xl hover:underline cursor-pointer">
                                {t('home.popularAlbums')}
                            </h1>
                            {album.length > 7 ? (
                                <p className="text-[14px] font-bold hover:underline cursor-pointer mr-7">
                                    {t('home.showAll')}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {album.map((item, index) => (
                                <Album
                                    key={index}
                                    id={item.ma_album}
                                    image={item.hinh_anh}
                                    name={item.ten_album}
                                    artist={item.ma_user?.name}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="px-6 mb-4 mt-8">
                        <div className="flex items-center justify-between text-white mb-2">
                            <h1 className=" font-bold text-2xl hover:underline cursor-pointer">Album phổ biến</h1>
                            {album.length > 6 ? (
                                <p className="text-[14px] font-bold hover:underline cursor-pointer mr-7">Hiện tất cả</p>
                            ) : null}
                        </div>
                        <div className="flex overflow-auto space-x-2 ml-[-6px]">
                            {album.slice(0, 7).map((item, index) => (
                                <Album
                                    key={index}
                                    id={item.ma_album}
                                    image={item.hinh_anh}
                                    name={item.ten_album}
                                    artist={item.ma_user?.name}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {isLoggedIn ? null : (
                    <div className="px-6 mb-4 mt-8">
                        <div className="flex items-center justify-between text-white mb-2">
                            <h1 className=" font-bold text-2xl hover:underline cursor-pointer">
                                {t('home.popularRadio')}
                            </h1>
                            <p className="text-[14px] font-bold hover:underline cursor-pointer mr-7">
                                {t('home.showAll')}
                            </p>
                        </div>
                        <div className="flex overflow-auto space-x-2 ml-[-6px]">
                            {playlistsData.slice(0, 7).map((item, index) => (
                                <PlayList
                                    key={index}
                                    id={item.id}
                                    image={assets.img14}
                                    name={item.name}
                                    desc={item.desc}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <Footer />
            </div>
        </>
    );
}

export default Home;

// TASK: Làm podcast ở trang home *
// TASK: Thêm tính năng lưu vào thư viện, hiện đúng thư viện - CHƯA XONG
