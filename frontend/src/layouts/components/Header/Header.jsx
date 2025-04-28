import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import TippyHeadless from '@tippyjs/react/headless';
import { useState, useEffect, useRef, useContext } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faArrowUpRightFromSquare,
    faFolderOpen,
    faHouse,
    faMagnifyingGlass,
    fas,
} from '@fortawesome/free-solid-svg-icons';
import { assets } from '@/assets/assets';
import { LuMessageSquareMore } from 'react-icons/lu';
import { FaRegBell } from 'react-icons/fa';
import config from '@/configs';
import { useTranslation } from 'react-i18next';
import Search from '@/pages/Search';
import { useSelector } from 'react-redux';
import Language from '../Language/Language';

function Header() {
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const [isFocused, setIsFocused] = useState(false);
    const [username, setUsername] = useState('');
    const [targetUser, setTargetUser] = useState(false);
    const [hovering, setHovering] = useState(false);

    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        } else {
            setUsername('Dai');
        }
    }, []);

    const handleFocus = () => {
        if (inputRef.current) inputRef.current.focus();
    };

    const handleBlur = () => {
        if (inputRef.current) inputRef.current.blur();
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        localStorage.removeItem('id_user');
        localStorage.removeItem('musicPlayerState');
        localStorage.removeItem('name_user');

        window.location.reload();
    };

    return (
        <>
            <div className="w-full h-[8%] flex justify-between items-center font-semibold px-2 pt-2">
                <div className="ml-5 flex-1 flex items-center gap-2">
                    <Link to={config.routes.home}>
                        <img className="w-8 h-8" src={assets.spotify_logo} alt="" />
                    </Link>
                    <div className="mt-8">
                        <Language />
                    </div>{' '}
                </div>

                <div className="flex flex-1 items-center gap-2 mr-24 focus:outline-white">
                    <Link to={config.routes.home}>
                        <Tippy content="Trang chủ">
                            <button className="text-black bg-[#1f1f1f] w-12 h-12 rounded-full flex justify-center items-center hover:scale-105">
                                <FontAwesomeIcon icon={faHouse} size="lg" className="text-white" />
                            </button>
                        </Tippy>
                    </Link>
                    <div className="block w-full">
                        <div
                            className={`relative w-full h-[48px] rounded-full flex items-center gap-2 ${
                                isFocused ? 'outline outline-white outline-2' : ''
                            } bg-[#1f1f1f] text-[#b3b3b3] transition-all duration-150 cursor-pointer hover:bg-[#2a2a2a]`}
                        >
                            <Search />
                        </div>
                    </div>
                </div>

                <div className={`flex items-center gap-5 ${isLoggedIn ? '' : 'w-[446px] justify-end'}`}>
                    {isLoggedIn ? (
                        <>
                            <button className="bg-white text-black font-bold text-[14px] px-4 py-1.5 rounded-2xl hidden md:block hover:scale-105 hover:bg-[#f0f0f0]">
                                {t('header.premium')}
                            </button>
                            <button
                                // onClick={() => {
                                //     navigate("/chat");
                                // }}
                                className="text-[#b3b3b3] hover:text-white hover:scale-110 cursor-pointer"
                            >
                                <Link to="/chat">
                                    <LuMessageSquareMore size={20} />
                                </Link>
                            </button>
                            <Tippy content="Thông tin mới">
                                <button className="text-[#b3b3b3] hover:text-white hover:scale-110 cursor-pointer">
                                    <FaRegBell />
                                </button>
                            </Tippy>
                            <TippyHeadless
                                interactive
                                visible={hovering || targetUser}
                                placement="bottom-end"
                                render={(attrs) => (
                                    <div
                                        className="box text-white text-[14px] font-semibold bg-[#282828] px-1 py-2 mr-1 rounded-md shadow-xl"
                                        tabIndex="-1"
                                        {...attrs}
                                    >
                                        {targetUser ? (
                                            <div className="min-w-[196px] h-56">
                                                <button className="flex items-center justify-between w-full py-3 pl-3 pr-2 rounded-[4px] cursor-pointer hover:bg-[#ffffff1a]">
                                                    <span> {t('header.title')}</span>
                                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="sm" />
                                                </button>
                                                <Link to={config.routes.user + `/${localStorage.getItem('userId')}`}>
                                                    <button className="flex items-center justify-between w-full py-3 pl-3 pr-2 rounded-[4px] cursor-pointer hover:bg-[#ffffff1a]">
                                                        <span>{t('header.profile')}</span>
                                                    </button>
                                                </Link>
                                                <button className="flex items-center justify-between w-full py-3 pl-3 pr-2 rounded-[4px] cursor-pointer hover:bg-[#ffffff1a]">
                                                    <span>{t('header.updatePremium')}</span>
                                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="sm" />
                                                </button>
                                                <button className="flex items-center justify-between w-full py-3 pl-3 pr-2 rounded-[4px] border-b-[1px] rounded-b-[1px] cursor-pointer hover:bg-[#ffffff1a]">
                                                    <span>{t('header.setting')}</span>
                                                </button>
                                                <Link to={config.routes.home}>
                                                    <button
                                                        className="flex items-center justify-between w-full py-3 pl-3 pr-2 rounded-[4px] cursor-pointer hover:bg-[#ffffff1a]"
                                                        onClick={handleLogout}
                                                    >
                                                        <span>{t('header.logout')}</span>
                                                    </button>
                                                </Link>
                                            </div>
                                        ) : (
                                            username
                                        )}
                                    </div>
                                )}
                            >
                                <button
                                    className="text-black bg-[#1f1f1f] w-12 h-12 rounded-full flex justify-center items-center"
                                    onMouseEnter={() => setHovering(true)}
                                    onMouseLeave={() => setHovering(false)}
                                    onClick={() => {
                                        setTargetUser(!targetUser);
                                        setHovering(false);
                                    }}
                                >
                                    <span className="w-8 h-8 bg-[#f573a0] leading-8 rounded-full font-bold text-[14px]">
                                        {username ? username.charAt(0).toUpperCase() : 'N'}
                                    </span>
                                </button>
                            </TippyHeadless>
                        </>
                    ) : (
                        <>
                            <Link to={config.routes.login}>
                                <button className="bg-black text-[#b3b3b3] font-bold px-4 py-1.5 rounded-2xl hidden md:block hover:scale-105 hover:text-white">
                                    {t('header.login')}
                                </button>
                            </Link>
                            <Link to={config.routes.signup}>
                                <button className="flex items-center bg-white text-black font-bold px-8 py-3 rounded-full cursor-pointer gap-2 hover:scale-105">
                                    {t('header.register')}
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default Header;
