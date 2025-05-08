import { useEffect, useState } from "react";
import { getAllSongs, approveSongStatus } from "@/service/apiService"; // Thêm hàm approveSong
import { Link } from "react-router-dom";

const Song = () => {
  const [songs, setSongs] = useState([]);

  const fetchAllSongs = async () => {
    try {
      const response = await getAllSongs(); // Gọi API đúng cách
      const listOfSongs = response.data;
      setSongs(listOfSongs);
      console.log(response)
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài hát:", error);
    }
  };

  const handleChangeStatus = async (songId, status) => {
    try {
      await approveSongStatus(songId, status); // Pass status to API
      alert("Đã xử lý!");
      fetchAllSongs(); // Refresh album list
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái album:", error);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  useEffect(() => {
    fetchAllSongs();
  }, []);

  return (
    <div className="w-full p-6 bg-gray-800">
      <h2 className="text-2xl font-bold mb-4">Danh sách bài hát</h2>
      <div className="bg-gray-700 rounded-lg">
        <div className="max-h-[570px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-600 sticky top-0">
              <tr>
                <th className="p-3 text-left">Mã bài hát</th>
                <th className="p-3 text-left">Artist</th>
                <th className="p-3 text-left">Tên bài hát</th>
                <th className="p-3 text-left">Audio</th>
                <th className="p-3 text-left">Ngày phát hành</th>
                <th className="p-3 text-left">Hình ảnh</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Hành động</th> {/* Thêm cột Hành động */}
              </tr>
            </thead>
            <tbody>
              {songs.length > 0 ? (
                songs.map((song) => (
                  <tr key={song.ma_bai_hat}>
                    <td className="p-3 text-left">{song.id}</td>
                    <td className="p-3 text-left">{song.ma_user.name}</td>
                    <td className="p-3 text-left">{song.ten_bai_hat}</td>
                    <td className="p-3 text-left">
                      <Link to={song.audio} className="text-blue-500 hover:underline">
                        File âm thanh
                      </Link>
                      </td>
                    <td className="p-3 text-left">{song.ngay_phat_hanh}</td>
                    <td className="p-3 text-left">
                      <img src={song.hinh_anh} alt="Bài hát" className="w-12 h-12 rounded" />
                    </td>
                    <td className="p-3 text-left">
                      {song.trang_thai === 2
                        ? "Đã duyệt"
                        : song.trang_thai === 1
                          ? "Đang chờ duyệt"
                          : song.trang_thai === 0
                            ? "Đã từ chối"
                            : "Không rõ"}
                    </td>
                    <td className="p-3 text-left space-x-2">
                      {song.trang_thai === 1 && (
                        <>
                          <button
                            onClick={() => handleChangeStatus(song.id, 2)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleChangeStatus(song.id, 0)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </td>
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
    </div>
  );
};

export default Song;