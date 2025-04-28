import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faPencil, faUser } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import Footer from '@/layouts/components/Footer';
import Artist from '@/components/Artist';

function Profile() {
    const { id } = useParams();

    const [username, setUsername] = useState('');
    const [hovering, setHovering] = useState(false);
    const [userData, setUserData] = useState('');

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        document.title = `Spotify - ${username ? username : userData.name}`;
    });

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    });

    useEffect(() => {
        const user = usersData.find((item) => item._id === id);
        if (user) {
            setUserData(user);
        }
    }, [id, userData]);

    const handleFollow = () => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            null;
        } else {
            toast.error(
                <div>
                    <h4 className="text-black font-bold">Bạn đã đăng xuất</h4>
                    <p className="text-black text-[14px]">Đăng nhập để theo dõi hồ sơ này trên Spotify.</p>
                </div>,
                {
                    position: 'top-right',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                },
            );
        }
    };

    return (
        <div className="bg-gradient-to-b from-[#555555] to-[#121212] w-[79%] h-[97.4%] rounded-xl my-2 mr-2 py-4 overflow-hidden overflow-y-auto">
            <div className="mt-4 mb-9 px-6 flex flex-col md:flex-row md:items-end gap-8">
                <div>
                    <input type="file" id="song" accept="audio/*" hidden />
                    <label htmlFor="song">
                        <div
                            className="w-56 h-56 flex justify-center items-center bg-[#282828] rounded-full cursor-pointer"
                            onMouseEnter={() => setHovering(true)}
                            onMouseLeave={() => setHovering(false)}
                        >
                            <FontAwesomeIcon
                                className={`text-7xl ${hovering ? 'text-white' : 'text-[#7f7f7f]'}`}
                                icon={hovering ? faPencil : faUser}
                            />
                        </div>
                    </label>
                </div>
                <div>
                    <p className="text-white mb-2">Hồ sơ</p>
                    <h2 className="text-white text-5xl font-extrabold mb-4 md:text-6xl tracking-tight">
                        {usersData.map((item) => {
                            if (item._id === id) {
                                return item.name;
                            }
                        })}
                    </h2>
                </div>
            </div>
            <div className="bg-[#121212] pt-1">
                {userData.name === username ? null : (
                    <>
                        <div className="px-6 py-9">
                            <div className="flex gap-10">
                                <button
                                    className="text-white text-[14px] font-bold px-4 py-1 border-[1px] border-[#7c7c7c] rounded-full hover:scale-105 hover:border-white"
                                    onClick={handleFollow}
                                >
                                    Theo dõi
                                </button>
                                <button className="text-[#b3b3b3] text-2xl hover:scale-105 hover:text-white">
                                    <FontAwesomeIcon icon={faEllipsis} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
                {userId === id ? (
                    <>
                        <button className="text-[#b3b3b3] text-2xl px-6 py-3 my-4 hover:scale-105 hover:text-white">
                            <FontAwesomeIcon icon={faEllipsis} />
                        </button>
                        <div className="px-6">
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h1 className="text-white font-bold text-2xl hover:underline cursor-pointer">
                                            Nghệ sĩ hàng đầu tháng này
                                        </h1>
                                        <p className="text-[14px] text-[#b3b3b3] font-medium hover:underline cursor-pointer mr-7">
                                            Chỉ hiện thị với bạn
                                        </p>
                                    </div>
                                    <p className="text-[14px] text-white font-bold hover:underline cursor-pointer mr-7">
                                        Hiện tất cả
                                    </p>
                                </div>
                                <div className="flex overflow-auto space-x-2 ml-[-6px]">
                                    {artistsData.slice(0, 7).map((item, index) => (
                                        <Artist
                                            key={index}
                                            id={item._id}
                                            image={item.image}
                                            name={item.name}
                                            desc={item.desc}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 px-6">
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h1 className="text-white font-bold text-2xl hover:underline cursor-pointer">
                                            Bản nhạc hàng đầu tháng này
                                        </h1>
                                        <p className="text-[14px] text-[#b3b3b3] font-medium hover:underline cursor-pointer mr-7">
                                            Chỉ hiện thị với bạn
                                        </p>
                                    </div>
                                    <p className="text-[14px] text-white font-bold hover:underline cursor-pointer mr-7">
                                        Hiện tất cả
                                    </p>
                                </div>
                                {songsData.map((item, index) => {
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => playWithId(item._id)}
                                            className="grid grid-cols-2 sm:grid-cols-[1.7fr_1fr_0.3fr] gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
                                        >
                                            <div className="flex items-center">
                                                <b className="mr-4">{index + 1}</b>
                                                <img className="inline w-10 mr-5" src={item.image} alt="" />
                                                <div>
                                                    <p className="text-white font-semibold">{item.name}</p>
                                                    <p className="text-[14px] font-semibold">{item.artist}</p>
                                                </div>
                                            </div>
                                            <div className="text-[15px] font-semibold">
                                                <p>{item.albums}</p>
                                            </div>
                                            <div className="text-center">
                                                <p>{item.duration}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : null}
                <Footer />
            </div>
        </div>
    );
}

export default Profile;
