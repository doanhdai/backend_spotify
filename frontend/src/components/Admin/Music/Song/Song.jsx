import { useEffect, useState } from "react";
import { getAllSongs, approveSongStatus } from "@/service/apiService"; // Thêm hàm approveSong

const Song = () => {
  const [songs, setSongs] = useState([]);

  const fetchAllSongs = async () => {
    try {
      const response = await getAllSongs(); // Gọi API đúng cách
      const listOfSongs = response.data;
      setSongs(listOfSongs);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài hát:", error);
    }
  };

  const handleApprove = async (songId) => {
    try {
      await approveSong(songId); // Gọi API kiểm duyệt bài hát
      alert("Bài hát đã được kiểm duyệt!");
      fetchAllSongs(); // Cập nhật lại danh sách bài hát
    } catch (error) {
      console.error("Lỗi khi kiểm duyệt bài hát:", error);
      alert("Kiểm duyệt thất bại!");
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
                    <td className="p-3 text-left">{song.ngay_phat_hanh}</td>
                    <td className="p-3 text-left">
                      <img src={song.hinh_anh} alt="Bài hát" className="w-12 h-12 rounded" />
                    </td>
                    <td className="p-3 text-left">{song.trang_thai == 1 ? "Đã duyệt" : "Chờ duyệt"}</td>
                    <td className="p-3 text-left">
                      <button
                        onClick={() => handleApprove(song.ma_bai_hat)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Kiểm duyệt
                      </button>
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