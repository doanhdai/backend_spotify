import { useEffect, useState } from "react";
import { getAllSongs } from "@/service/apiService";

const Song = () => {
  const [songs, setSongs] = useState([]);

  const fetchAllSongs = async () => {
    try {
      const response = await getAllSongs(); // Gọi API đúng cách
      const listOfSongs = response.data;
      // console.log("Dữ liệu bài hát:", listOfSongs); // Console.log dữ liệu
      setSongs(listOfSongs);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài hát:", error);
    }
  };

  useEffect(() => {
    fetchAllSongs();
  }, []);

  return (
    <div className="w-full p-6 bg-gray-800">
      <h2 className="text-2xl font-bold mb-4">Danh sách bài hát</h2>
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-600">
            <tr>
              <th className="p-3 text-left">Mã bài hát</th>
              <th className="p-3 text-left">Artist</th>
              <th className="p-3 text-left">Tên bài hát</th>
              <th className="p-3 text-left">Ngày phát hành</th>
              <th className="p-3 text-left">Thời lượng</th>
              <th className="p-3 text-left">Hình ảnh</th>
              <th className="p-3 text-left">Trạng thái</th>
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
                  <td className="p-3 text-left">{song.thoi_luong}</td>
                  <td className="p-3 text-left">
                    <img src={song.hinh_anh} alt="Bài hát" className="w-12 h-12 rounded" />
                  </td>
                  <td className="p-3 text-left">{song.trang_thai == 1 ? "Đã duyệt" : "Chờ duyệt"}</td>
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
  );
};

export default Song;
