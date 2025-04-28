import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import config from '@/configs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faMusic, faList, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllPlaylist } from '@/service/apiService';

const SidebarAdmin = () => {
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const navigate = useNavigate();

    return (
        <div className="w-[17.5%] h-[100%] bg-[#121212] p-4 text-white hidden lg:flex flex-col">
            <ul className="space-y-2">
                <li className="group">
                    <button className="flex items-center justify-between w-full p-3 rounded-lg bg-[#1f1f1f] hover:bg-[#333]">
                        <span className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} /> Quản lý tài khoản
                        </span>
                        <FontAwesomeIcon icon={faChevronDown} className="group-hover:rotate-180 transition-transform" />
                    </button>
                    <ul className="hidden group-hover:block pl-5 space-y-1 mt-2">
                        <li><Link to={config.routes.admin_user} className="block p-2 hover:bg-[#2a2a2a] rounded">Người dùng</Link></li>
                        <li><Link to={config.routes.admin_artist} className="block p-2 hover:bg-[#2a2a2a] rounded">Nghệ sĩ</Link></li>
                    </ul>
                </li>
                <li className="group">
                    <button className="flex items-center justify-between w-full p-3 rounded-lg bg-[#1f1f1f] hover:bg-[#333]">
                        <span className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faMusic} /> Quản lý nhạc
                        </span>
                        <FontAwesomeIcon icon={faChevronDown} className="group-hover:rotate-180 transition-transform" />
                    </button>
                    <ul className="hidden group-hover:block pl-5 space-y-1 mt-2">
                        <li><Link to={config.routes.admin_song} className="block p-2 hover:bg-[#2a2a2a] rounded">Bài hát</Link></li>
                        <li><Link to={config.routes.admin_album} className="block p-2 hover:bg-[#2a2a2a] rounded">Album</Link></li>
                        <li><Link to={config.routes.admin_playlist} className="block p-2 hover:bg-[#2a2a2a] rounded">Playlist</Link></li>
                        <li><Link to={config.routes.admin_genre} className="block p-2 hover:bg-[#2a2a2a] rounded">Thể loại</Link></li>
                    </ul>
                </li>
                <li className='group'>
                    <button className="flex items-center justify-between w-full p-3 rounded-lg bg-[#1f1f1f] hover:bg-[#333]">
                        <span className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faMusic} /> Quản lý gói premium
                        </span>
                        <FontAwesomeIcon icon={faChevronDown} className="group-hover:rotate-180 transition-transform" />
                    </button>
                    <ul className="hidden group-hover:block pl-5 space-y-1 mt-2">
                        <li><Link to={config.routes.admin_premium} className="block p-2 hover:bg-[#2a2a2a] rounded">Danh sách gói premium</Link></li>
                        <li><Link to={config.routes.admin_premium_register} className="block p-2 hover:bg-[#2a2a2a] rounded">Danh sách đăng ký</Link></li>
                    </ul>    
                </li>
            </ul>
        </div>
    );
};

export default SidebarAdmin;
