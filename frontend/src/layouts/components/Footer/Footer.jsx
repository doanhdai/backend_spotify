import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function Footer() {
    const { t } = useTranslation();
    const socialIcons = [
        { icon: faInstagram, href: 'https://www.instagram.com/spotify' },
        { icon: faTwitter, href: 'https://x.com/spotify' },
        { icon: faFacebook, href: 'https://www.facebook.com/SpotifyVietnam/?brand_redir=6243987495' },
    ];

    return (
        <div className="flex-col px-8 pt-20 ">
            <div className="flex">
                <div className="flex flex-1">
                    <div className="w-48 h-44 mr-6 mb-8">
                        <ul>
                            <li className="text-white font-bold">{t('footer.company')}</li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.about')}
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.jobs')}
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.forTheRecord')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="w-48 h-44 mr-6 mb-8">
                        <ul>
                            <li className="text-white font-bold">{t('footer.community')}</li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.forArtists')}
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.developers')}
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.advertising')}
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.investors')}
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.vendors')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="w-48 h-44 mr-6 mb-8">
                        <ul>
                            <li className="text-white font-bold">{t('footer.usefulLinks')}</li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.support')}
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.freeApp')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="w-48 h-44 mr-6 mb-8">
                        <ul>
                            <li className="text-white font-bold">{t('footer.spotifyPlans')}</li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.premiumIndividual')}
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.premiumStudent')}
                                </Link>
                            </li>
                            <li className="mt-2">
                                <Link className="text-[#b3b3b3] hover:text-white hover:underline">
                                    {t('footer.spotifyFree')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="flex gap-4">
                    {socialIcons.map((social, index) => (
                        <a key={index} href={social.href} target="_blank" rel="noopener noreferrer">
                            <div className="flex justify-center items-center w-10 h-10 rounded-[50%] text-white bg-[#292929] cursor-pointer hover:bg-[#727272]">
                                <FontAwesomeIcon icon={social.icon} size="lg" className="text-white" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>
            <hr className="mt-4 mb-9 border-0 border-t border-t-[1px] border-t-[#292929]" />
            <div className="mb-6 text-[14px]">
                <div className="flex">
                    <div className="flex-1">
                        <ul className="flex gap-5 text-[#b3b3b3]">
                            <li>
                                <a href="" className="hover:text-white">
                                    {t('footer.legal')}
                                </a>
                            </li>
                            <li>
                                <a href="" className="hover:text-white">
                                    {t('footer.safetyCenter')}
                                </a>
                            </li>
                            <li>
                                <a href="" className="hover:text-white">
                                    {t('footer.privacyPolicy')}
                                </a>
                            </li>
                            <li>
                                <a href="" className="hover:text-white">
                                    {t('footer.cookies')}
                                </a>
                            </li>
                            <li>
                                <a href="" className="hover:text-white">
                                    {t('footer.aboutAds')}
                                </a>
                            </li>
                            <li>
                                <a href="" className="hover:text-white">
                                    {t('footer.accessibility')}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="mr-4">
                        <span className="text-[14px] text-[#b3b3b3]">© 2024 Spotify AB</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;
