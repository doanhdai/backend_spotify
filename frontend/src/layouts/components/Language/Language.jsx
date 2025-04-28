import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { changeLanguage } from '@/redux/Reducer/appReducer';

const Language = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { i18n } = useTranslation();
    const dispatch = useDispatch();
    const languageRedux = useSelector((state) => state.app.language);

    const languages = [
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'en', name: 'English' },
    ];

    useEffect(() => {
        i18n.changeLanguage(languageRedux);
    }, [i18n, languageRedux]);

    const getLanguageName = (code) => {
        return languages.find((lang) => lang.code === code)?.name || 'Tiếng Việt';
    };

    const handleSelectLanguage = (langCode) => {
        dispatch(changeLanguage(langCode));
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-[14px] px-3 py-1 mx-6 mb-8 border-[1px] border-[#7c7c7c] rounded-full font-bold hover:scale-105 hover:border-white text-white"
            >
                <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                {getLanguageName(languageRedux)}
            </button>

            {isOpen && (
                <div className="absolute left-6 top-full mt-2 bg-black shadow-md rounded-lg w-48 p-2 border text-white z-10">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelectLanguage(lang.code)}
                            className="w-full text-left px-4 py-2 hover:bg-yellow-950"
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Language;
