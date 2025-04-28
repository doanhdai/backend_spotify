import { useEffect, useState } from "react";
import { getAllPlaylist } from "@/service/apiService";

const Playlist = () => {
    const [playlists, setPlaylists] = useState([]);

    const fetchAllPlaylists = async () => {
        try {
            const respone = await getAllPlaylist();
            const data = respone.data;
            setPlaylists(data);
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchAllPlaylists();
    }, [])

    return (
        <div className="p-2 w-full bg-gray-800">
            <h2 className="text-2xl font-bold mb-4">Danh sách playlist</h2>
            <div className="bg-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-600">
                        <tr>
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">Tên người dùng</th>
                            <th className="p-3 text-left">Nghệ danh</th>
                            <th className="p-3 text-left">Ảnh đại diện</th>
                            <th className="p-3 text-left">Trạng thái</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td className="p-3 text-left">USR0001</td>
                            <td className="p-3 text-left">ltgiai</td>
                            <td className="p-3 text-left">tuangiai52@gmail.com</td>
                            <td className="p-3 text-left">truigbeovnamep</td>
                            <td className="p-3 text-left">Đang hoạt động</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Playlist;