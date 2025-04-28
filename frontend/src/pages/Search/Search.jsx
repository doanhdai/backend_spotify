import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faFolderOpen, faTimes } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import config from '@/configs';
import { useTranslation } from 'react-i18next';

function Search() {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const query = searchParams.get('keyword') || '';
        setSearchTerm(query);
    }, [location.search]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            if (location.pathname !== '/') {
                return;
            }
        } else {
            const delaySearch = setTimeout(() => {
                navigate(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`);
            }, 50);

            return () => clearTimeout(delaySearch);
        }
    }, [searchTerm, navigate, location.pathname]);

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        navigate('/'); // Xóa input và reset về trang chủ
    };

    const handleBrowseClick = () => {
        navigate(config.routes.category);
    };

    return (
        <>
            <div>
                <Tippy content={t('header.search')}>
                    <div className="flex">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="w-6 h-6 px-3 hover:text-white transition-colors duration-200"
                        />
                    </div>
                </Tippy>
            </div>
            <div className="relative flex items-center w-full">
                <input
                    className="bg-transparent w-full h-full focus:outline-none"
                    type="text"
                    placeholder={t('header.inputsearch')}
                    value={searchTerm}
                    onChange={handleChange}
                />
                {searchTerm && (
                    <button onClick={handleClearSearch} className="absolute right-2 text-red-500">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
            </div>
            <div className="absolute right-[60px] h-[24px] w-[1px] bg-gray-500"></div>
            <div>
                <Tippy content={t('header.browse')}>
                    <div
                        onClick={handleBrowseClick}
                        className="px-5 text-[#b3b3b3] relative hover:text-white hover:scale-110 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faFolderOpen} />
                    </div>
                </Tippy>
            </div>
        </>
    );
}

export default Search;
