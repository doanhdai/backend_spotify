import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle, faSignOutAlt, faCog, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { assets } from '@/assets/assets';
import config from '@/configs';
import { useTranslation } from 'react-i18next';

function HeaderAdmin() {
    const inputRef = useRef(null);
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const [username, setUsername] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        setUsername(storedUsername || 'Admin');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.reload();
    };

    return (
        <header className="bg-gray-900 text-white shadow-md w-full h-16 flex items-center px-6 justify-between">
            {/* Logo */}
            <div className="flex items-center">
                <Link to={config.routes.adminDashboard}>
                    <img className="w-10 h-10" src={assets.spotify_logo} alt="Admin Logo" />
                </Link>
                <h1 className="ml-3 text-xl font-semibold">Administration</h1>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-1/3">
                <input
                    ref={inputRef}
                    className="w-full bg-gray-800 text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring focus:ring-blue-500"
                    type="text"
                    placeholder={t('header.search')}
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            {/* Icons & User Dropdown */}
            <div className="flex items-center gap-6">
                <Tippy content={t('header.notifications')}>
                    <button className="text-gray-300 hover:text-white">
                        <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
                    </button>
                </Tippy>
                
                {isLoggedIn ? (
                    <Tippy content={t('header.profile')} interactive>
                        <div className="relative group cursor-pointer">
                            <button className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
                                <span>{username}</span>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link to={config.routes.profile} className="block px-4 py-2 hover:bg-gray-200">
                                    <FontAwesomeIcon icon={faUserCircle} className="mr-2" /> {t('header.profile')}
                                </Link>
                                <Link to={config.routes.settings} className="block px-4 py-2 hover:bg-gray-200">
                                    <FontAwesomeIcon icon={faCog} className="mr-2" /> {t('header.settings')}
                                </Link>
                                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-200">
                                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> {t('header.logout')}
                                </button>
                            </div>
                        </div>
                    </Tippy>
                ) : (
                    <Link to={config.routes.login} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                        {t('header.login')}
                    </Link>
                )}
            </div>
        </header>
    );
}

export default HeaderAdmin;