import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import config from '@/configs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faMusic, faList, faChevronDown, faChartBar, faChartColumn } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllPlaylist } from '@/service/apiService';

const SidebarArtist = () => {
    return (
        <div className="w-[17.5%] min-h-screen bg-gray-200 p-4 font-semibold hidden lg:flex flex-col shadow-lg">
            <ul className="space-y-2">
                <li>
                    <Link to={config.routes.artist_dashboard} className="flex items-center justify-between w-full p-3 rounded-lg bg-cyan-900 hover:bg-[#40739e] transition-colors">
                        <span className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} /> Tổng quan
                        </span>
                    </Link>
                </li>
                <li className="group">
                    <button className="flex items-center justify-between w-full p-3 rounded-lg bg-cyan-900 hover:bg-[#40739e] transition-colors">
                        <span className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faList} /> Danh sách âm nhạc
                        </span>
                        <FontAwesomeIcon icon={faChevronDown} className="group-hover:rotate-180 transition-transform" />
                    </button>
                    <ul className="hidden group-hover:block pl-5 space-y-1 mt-2">
                        <li><Link to={config.routes.artist_song} className="block p-2 hover:bg-[#1e272e] rounded transition text-white">Bài hát</Link></li>
                        <li><Link to={config.routes.artist_album} className="block p-2 hover:bg-[#1e272e] rounded transition text-white">Album</Link></li>
                        <li><Link to={config.routes.artist_playlist} className="block p-2 hover:bg-[#1e272e] rounded transition text-white">Playlist</Link></li>
                    </ul>
                </li>
                <li className="group">
                    <button className="flex items-center justify-between w-full p-3 rounded-lg bg-cyan-900 hover:bg-[#40739e] transition-colors">
                        <span className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faMusic} /> Tạo
                        </span>
                        <FontAwesomeIcon icon={faChevronDown} className="group-hover:rotate-180 transition-transform" />
                    </button>
                    <ul className="hidden group-hover:block pl-5 space-y-1 mt-2">
                        <li><Link to={config.routes.artist_create_album} className="block p-2 hover:bg-[#1e272e] rounded transition">Album</Link></li>
                        <li><Link to={config.routes.artist_create_song} className="block p-2 hover:bg-[#1e272e] rounded transition">Bài hát</Link></li>
                    </ul>
                </li>
                <li className='group'>
                    <button className="flex items-center justify-between w-full p-3 rounded-lg bg-cyan-900 hover:bg-[#40739e] transition-colors">
                        <span className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faChartColumn} /> Thống kê
                        </span>
                        <FontAwesomeIcon icon={faChevronDown} className="group-hover:rotate-180 transition-transform" />
                    </button>
                    <ul className="hidden group-hover:block pl-5 space-y-1 mt-2">
                        <li><Link to={config.routes.artist_listens} className="block p-2 hover:bg-[#1e272e] rounded transition">Lượt nghe</Link></li>
                        <li><Link to={config.routes.artist_turnover} className="block p-2 hover:bg-[#1e272e] rounded transition">Doanh thu</Link></li>
                    </ul>
                </li>
            </ul>
        </div>
    );
};

export default SidebarArtist;


