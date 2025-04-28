import Tippy from '@tippyjs/react';
import TippyHeadless from '@tippyjs/react/headless';
import 'tippy.js/dist/tippy.css';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faGlobe, faMagnifyingGlass, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { assets } from '@/assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import config from '@/configs';
import Language from '../Language/language';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getAllPlaylist, deletePlaylist, createNewPlaylist } from '@/service/apiService';
import { setPlaylists } from '@/redux/Reducer/playlistSlice';

const Sidebar = () => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const playlists = useSelector((state) => state.playlist.playlists);
    const headerRef = useRef();
    const navigate = useNavigate();

    const { t } = useTranslation();
    const GetAllPlaylist = async () => {
        try {
            const response = await getAllPlaylist();
            setPlaylists(response.data);
            // console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        GetAllPlaylist();
    }, []);
    const [contextMenu, setContextMenu] = useState({ visible: false, playlistId: null, x: 0, y: 0 });

    const handlerScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        if (scrollTop > 0) {
            headerRef.current.style.boxShadow = '0 6px 10px rgba(0, 0, 0, .6)';
        } else {
            headerRef.current.style.boxShadow = 'none';
        }
    };

    useEffect(() => {
        const fetchInitialPlaylists = async () => {
            if (playlists.length === 0) {
                try {
                    const response = await getAllPlaylist();
                    dispatch(setPlaylists(response.data));
                } catch (error) {
                    console.log(error);
                }
            }
        };
        fetchInitialPlaylists();
    }, [dispatch, playlists.length]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contextMenu.visible) {
                handleCloseContextMenu();
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [contextMenu.visible]);

    // console.log(playlists);

    const handleContextMenu = (e, playlistId) => {
        e.preventDefault();
        if (!playlistId) return;

        setContextMenu({
            visible: true,
            playlistId,
            x: e.pageX,
            y: e.pageY,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu({ visible: false, playlistId: null, x: 0, y: 0 });
    };

    const handleDeletePlaylist = async (id) => {
        try {
            await deletePlaylist(id);
            const updatedPlaylists = playlists.filter((playlist) => playlist.ma_playlist !== id);
            dispatch(setPlaylists(updatedPlaylists));
            handleCloseContextMenu();
        } catch (error) {
            console.error('Lỗi khi xóa playlist:', error);
            alert('Không thể xóa playlist.');
        }
    };
    const handleCreatePlaylist = async () => {
        try {
            const response = await createNewPlaylist();
            const newPlaylist = response.data;
            dispatch(setPlaylists([...playlists, newPlaylist]));
        } catch (error) {
            console.error('Lỗi khi tạo playlist:', error);
        }
    };

    const handleEditPlaylist = (id) => {
        handleCloseContextMenu();
    };

    return (
        <div className="w-[21%] h-full p-2 flex-col gap-2 text-white hidden lg:flex">
            <div className="bg-[#121212] h-full rounded-xl">
                <div ref={headerRef}>
                    <div className="p-4 pt-5 flex items-center justify-between mx-2 z-10">
                        <div className="flex items-center gap-3">
                            <img className="w-6" src={assets.stack_icon} alt="" />
                            <p className="font-semibold">{t('library')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Tippy content="Tạo danh sách phát">
                                <button
                                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#1f1f1f]"
                                    onClick={handleCreatePlaylist}
                                >
                                    <img className="w-4" src={assets.plus_icon} alt="" />
                                </button>
                            </Tippy>
                            {isLoggedIn ? (
                                <Tippy content={t('see_more')}>
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#1f1f1f]">
                                        <img className="w-4" src={assets.arrow_icon} alt="" />
                                    </button>
                                </Tippy>
                            ) : null}
                        </div>
                    </div>
                </div>
                {isLoggedIn && playlists.length > 0 ? (
                    <>
                        <div className="p-3 pt-2 flex items-center mx-1 text-[14px] gap-2 text-b">
                            <button className="bg-[#2a2a2a] text-white px-4 py-1.5 rounded-2xl cursor-pointer font-semibold hover:bg-[#333333] transition-colors duration-200">
                                Danh sách phát
                            </button>
                            <button className="bg-[#2a2a2a] text-white px-4 py-1.5 rounded-2xl cursor-pointer font-semibold hover:bg-[#333333] transition-colors duration-200">
                                Album
                            </button>
                        </div>
                        <div className="flex px-8 pl-5 justify-between mb-1">
                            <button className="text-[#b3b3b3] w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#2a2a2a] hover:text-white">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4" />
                            </button>
                            <button className="flex items-center gap-2 text-[#b3b3b3] hover:text-white hover:scale-105">
                                <span className="text-[14px] font-semibold">{t('buttons.recent')}</span>
                                <FontAwesomeIcon icon={faBars} />
                            </button>
                        </div>

                        <div className="px-1 py-1 mx-2 mt-1 rounded font-semibold flex flex-col">
                            {playlists.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex px-3 py-2 hover:bg-[#1f1f1f] rounded-lg"
                                    onClick={() => navigate(config.routes.playlist + `/${item.ma_playlist}`)}
                                    onContextMenu={(e) => handleContextMenu(e, item.ma_playlist)} // Thêm sự kiện chuột phải
                                >
                                    <img className="w-12 rounded mr-3" src={item.hinh_anh} alt="" />
                                    <div>
                                        <h5 className="text-white">{item.ten_playlist}</h5>
                                        <p className="line-clamp-1 text-[#b3b3b3] text-[14px]">
                                            {t('playlist.category')} {localStorage.getItem('name_user')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Context Menu */}
                        {contextMenu.visible && contextMenu.playlistId !== null && (
                            <div
                                className="fixed bg-[#282828] text-white text-[14px] font-semibold rounded-md shadow-xl z-50"
                                style={{
                                    position: 'fixed',
                                    left: contextMenu.x,
                                    top: contextMenu.y,
                                    minWidth: '200px',
                                }}
                            >
                                <button
                                    className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[#ffffff1a]"
                                    onClick={() => handleEditPlaylist(contextMenu.playlistId)}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                    <span>Chỉnh sửa playlist</span>
                                </button>
                                <button
                                    className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[#ffffff1a]"
                                    onClick={() => handleDeletePlaylist(contextMenu.playlistId)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                    <span>Xóa playlist</span>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div
                            className="h-[45%] flex flex-col gap-6 p-2 overflow-hidden overflow-y-auto"
                            onScroll={handlerScroll}
                        >
                            <section className="px-6 py-4 bg-[#1f1f1f] rounded-lg">
                                <div>
                                    <h1 className="text-white font-bold mb-2">{t('createPlaylistSection.title')}</h1>
                                    <p className="text-[14px] mb-6">{t('createPlaylistSection.subtitle')}</p>
                                </div>
                                <div>
                                    {isLoggedIn ? (
                                        <button
                                            className="text-[14px] text-black bg-white px-4 py-1 rounded-full font-bold hover:scale-105 hover:bg-[#f0f0f0]"
                                            onClick={handleCreatePlaylist}
                                        >
                                            Tạo danh sách phát
                                        </button>
                                    ) : (
                                        <button
                                            className="text-[14px] text-black bg-white px-4 py-1 rounded-full font-bold hover:scale-105 hover:bg-[#f0f0f0]"
                                            onClick={() => navigate('/login')}
                                        >
                                            Tạo danh sách phát
                                        </button>
                                    )}
                                </div>
                            </section>
                            <section className="px-6 py-4 bg-[#1f1f1f] rounded-lg">
                                <div>
                                    <h1 className="text-white font-bold mb-2">{t('podcastSection.title')}</h1>
                                    <p className="text-[14px] mb-6">{t('podcastSection.subtitle')}</p>
                                </div>
                                <div>
                                    <Link to={config.routes.genre + `/670655c188f507216de96d30`}>
                                        <button className="text-[14px] text-black bg-white px-4 py-1 rounded-full font-bold hover:scale-105 hover:bg-[#f0f0f0]">
                                            {t('buttons.browsePodcasts')}
                                        </button>
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </>
                )}
                {playlists.length == 0 ? (
                    <div>
                        <div className="px-6 my-8">
                            <div className="flex flex-wrap">
                                <div className="mr-4 mb-2">
                                    <a href="" className="text-[11px] text-[#b3b3b3]">
                                        {t('footer.legal')}
                                    </a>
                                </div>
                                <div className="mr-4 mb-2">
                                    <a href="" className="text-[11px] text-[#b3b3b3]">
                                        {t('footer.safetyCenter')}
                                    </a>
                                </div>
                                <div className="mr-4 mb-2">
                                    <a href="" className="text-[11px] text-[#b3b3b3]">
                                        {t('footer.privacyPolicy')}
                                    </a>
                                </div>
                                <div className="mr-4 mb-2">
                                    <a href="" className="text-[11px] text-[#b3b3b3]">
                                        {t('footer.cookies')}
                                    </a>
                                </div>
                                <div className="mr-4 mb-2">
                                    <a href="" className="text-[11px] text-[#b3b3b3]">
                                        {t('footer.aboutAds')}
                                    </a>
                                </div>
                                <div className="mr-4 mb-2">
                                    <a href="" className="text-[11px] text-[#b3b3b3]">
                                        {t('footer.accessibility')}
                                    </a>
                                </div>
                            </div>
                            <a href="" className="text-white text-[12px]">
                                {t('footer.cookies')}
                            </a>
                        </div>
                        <div>
                            <Language />
                        </div>
                    </div>
                ) : (
                    ''
                )}
            </div>
        </div>
    );
};

export default Sidebar;
