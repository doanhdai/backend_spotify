import { Link } from "react-router-dom";
import { FaUser, FaLock, FaBell, FaGlobe, FaSignOutAlt } from "react-icons/fa";

function Settings() {
    const settingsOptions = [
        { icon: <FaUser />, text: "Tài khoản", link: "/settings/account" },
        { icon: <FaLock />, text: "Bảo mật & Quyền riêng tư", link: "/settings/privacy" },
        { icon: <FaBell />, text: "Thông báo", link: "/settings/notifications" },
        { icon: <FaGlobe />, text: "Ngôn ngữ", link: "/settings/language" },
        { icon: <FaSignOutAlt />, text: "Đăng xuất", link: "/logout" }
    ];

    return (
        <div className="flex flex-col w-full h-full bg-black p-2 text-white">
            <div className="bg-[#121212] rounded-xl w-full h-full px-12 py-4">
                <h2 className="text-2xl font-bold mb-6">Cài đặt</h2>
                <div className="flex flex-col gap-4">
                    {settingsOptions.map((option, index) => (
                        <Link
                            key={index}
                            to={option.link}
                            className="flex items-center gap-4 p-4 bg-[#1E1E1E] rounded-lg hover:bg-[#282828] transition duration-300"
                        >
                            <span className="text-xl">{option.icon}</span>
                            <span className="text-lg">{option.text}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Settings;