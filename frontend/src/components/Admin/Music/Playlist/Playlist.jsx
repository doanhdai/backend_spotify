import { useEffect, useState } from "react";
import { getAllPlaylist } from "@/service/apiService";

const Playlist = () => {
  const [playlists, setPlaylists] = useState([]);

  const fetchAllPlaylists = async () => {
    try {
      const respone = await getAllPlaylist();
      const data = respone.data;
      setPlaylists(data);
      // console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchAllPlaylists();
  }, [])

  return (
    <div className="w-full p-6 bg-gray-800">
      <h2 className="text-2xl font-bold mb-4">Danh sách playlist</h2>
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-600">
            <tr>
              <th className="p-3 text-left">Mã playlist</th>
              <th className="p-3 text-left">Tên playlist</th>
              <th className="p-3 text-left">Số lượng bài hát</th>
              <th className="p-3 text-left">Hình ảnh</th>
              <th className="p-3 text-left">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <tr key={playlist.id}>
                  <td className="p-3 text-left">{playlist.id}</td>
                  <td className="p-3 text-left">{playlist.name}</td>
                  <td className="p-3 text-left">{playlist.name}</td>
                  <td className="p-3 text-left">
                    <img src={playlist.avatar} alt="avatar" className="w-12 h-12 rounded" />
                  </td>
                  <td className="p-3 text-left">{playlist.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Playlist;