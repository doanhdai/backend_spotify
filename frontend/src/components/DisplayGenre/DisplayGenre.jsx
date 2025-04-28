import { useEffect, useRef, useContext, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import PlayList from '@/components/PlayList';
import GenreItem from '@/components/GenreItem';
import config from '@/configs';
import Footer from '@/layouts/components/Footer';

function DisplayGenre() {
    const { id } = useParams();

    const [genreData, setGenreData] = useState('');

    const displayGenreRef = useRef();
    const location = useLocation();
    const isGenre = location.pathname.includes('genre');
    const bgColor = genreData ? genreData.bgColor : '';

    useEffect(() => {
        if (genreData.name === 'Nhạc') {
            document.title = 'Spotify - Nhạc';
        } else if (genreData.name === 'Podcasts') {
            document.title = 'Spotify - Podcasts';
        } else if (genreData.name === 'Dành Cho Bạn') {
            document.title = 'Spotify - Dành Cho Bạn';
        }
    });

    useEffect(() => {
        const genre = genresData.find((item) => item._id === id);
        if (genre) {
            setGenreData(genre);
        }
    }, [id, genresData]);

    useEffect(() => {
        if (isGenre && displayGenreRef.current) {
            displayGenreRef.current.style.background = `linear-gradient(${bgColor}, #121212)`;
        } else if (displayGenreRef.current) {
            displayGenreRef.current.style.background = `#121212`;
        }
    }, [isGenre, bgColor]);

    return genreData ? (
        <div
            ref={displayGenreRef}
            className="bg-[#121212] w-[79%] h-[97.4%] rounded-xl my-2 mr-2 py-4 pt-0 overflow-hidden overflow-y-auto"
        >
            {genreData.name === 'Nhạc' && (
                <>
                    <div>
                        <h2 className="text-white text-5xl font-bold px-6 mb-4 mt-10 md:text-8xl">{genreData.name}</h2>
                    </div>
                    <div className="px-6 mb-4 mt-24">
                        <div className="flex items-center justify-between text-white mb-2">
                            <h1 className=" font-bold text-2xl hover:underline cursor-pointer">Khám phá âm nhạc mới</h1>
                        </div>
                        <div className="flex overflow-auto space-x-2 ml-[-6px]">
                            {playlistsData.slice(2, 5).map((item, index) => (
                                <PlayList
                                    key={index}
                                    id={item._id}
                                    image={item.image}
                                    name={item.name}
                                    desc={item.desc}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="px-6 mb-4 mt-8">
                        <div className="flex items-center justify-between text-white mb-2">
                            <h1 className=" font-bold text-2xl hover:underline cursor-pointer">
                                Danh sách phát do Biên tập viên chọn
                            </h1>
                            <p className="text-[14px] font-bold hover:underline cursor-pointer mr-7">Hiện tất cả</p>
                        </div>
                        <div className="flex overflow-auto space-x-2 ml-[-6px]">
                            {playlistsData.slice(11, 18).map((item, index) => (
                                <PlayList
                                    key={index}
                                    id={item._id}
                                    image={item.image}
                                    name={item.name}
                                    desc={item.desc}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {genreData.name === 'Podcasts' && (
                <>
                    <div>
                        <h2 className="text-white text-5xl font-bold px-6 mb-4 mt-10 md:text-8xl">{genreData.name}</h2>
                    </div>
                    <div className="px-6 mb-4 mt-24">
                        <h1 className="text-white font-bold text-2xl ml-3 mb-2">Danh mục</h1>
                        <div className="grid grid-cols-4">
                            {genresData.slice(30, 46).map((item, index) => (
                                <GenreItem
                                    key={index}
                                    id={item._id}
                                    name={item.name}
                                    bgColor={item.bgColor}
                                    image={item.image}
                                    link={item.isEvent ? config.routes.concerts : config.routes.genre + `/${item._id}`}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {genreData.name === 'Dành Cho Bạn' && (
                <>
                    <div>
                        <h2 className="text-white text-5xl font-bold px-6 mb-4 mt-10 md:text-8xl">{genreData.name}</h2>
                    </div>
                    <div className="px-6 mb-4 mt-24">
                        <div className="flex items-center justify-between text-white mb-2">
                            <h1 className=" font-bold text-2xl hover:underline cursor-pointer">Của riêng mình bạn</h1>
                        </div>
                        <div className="flex overflow-auto space-x-2 ml-[-6px]">
                            {playlistsData.slice(21, 24).map((item, index) => (
                                <PlayList
                                    key={index}
                                    id={item._id}
                                    image={item.image}
                                    name={item.name}
                                    desc={item.desc}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}

            <Footer />
        </div>
    ) : null;
}

export default DisplayGenre;
