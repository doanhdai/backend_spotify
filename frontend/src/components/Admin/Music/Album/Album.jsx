import { useEffect, useState } from "react";
import { getAlbum, approveAlbumStatus } from "@/service/apiService";

const Album = () => {
  const [albums, setAlbums] = useState([]);

  const fetchAllAlbums = async () => {
    try {
      const response = await getAlbum();
      setAlbums(response.data);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeStatus = async (albumId, status) => {
    try {
      await approveAlbumStatus(albumId, status); // Pass status to API
      alert("Đã xử lý!");
      fetchAllAlbums(); // Refresh album list
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái album:", error);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  useEffect(() => {
    fetchAllAlbums();
  }, []);

  return (
    <div className="w-full p-6 bg-gray-800">
      <h2 className="text-2xl font-bold mb-4">Danh sách album</h2>
      <div className="bg-gray-700 rounded-lg">
        <div className="max-h-[570px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-600 sticky top-0">
              <tr>
                <th className="p-3 text-left">Mã album</th>
                <th className="p-3 text-left">Mã TK nghệ sĩ</th>
                <th className="p-3 text-left">Tên album</th>
                <th className="p-3 text-left">Ngày tạo</th>
                <th className="p-3 text-left">Số lượng bài hát</th>
                <th className="p-3 text-left">Hình ảnh</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {albums.length > 0 ? (
                albums.map((album) => (
                  <tr key={album.ma_album}>
                    <td className="p-3 text-left">{album.ma_album}</td>
                    <td className="p-3 text-left">{album.ma_user.name}</td>
                    <td className="p-3 text-left">{album.ten_album}</td>
                    <td className="p-3 text-left">{album.ngay_tao}</td>
                    <td className="p-3 text-left">10</td>
                    <td className="p-3 text-left">
                      <img
                        src={album.hinh_anh}
                        alt="album"
                        className="w-12 h-12 rounded"
                      />
                    </td>
                    <td className="p-3 text-left">
                      {album.trang_thai === 2
                        ? "Đã duyệt"
                        : album.trang_thai === 1
                        ? "Đang chờ duyệt"
                        : album.trang_thai === 0
                        ? "Đã từ chối"
                        : "Không rõ"}
                    </td>
                    <td className="p-3 text-left space-x-2">
                      {album.trang_thai === 1 && (
                        <>
                          <button
                            onClick={() => handleChangeStatus(album.ma_album, 2)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleChangeStatus(album.ma_album, 0)}
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
                  <td colSpan="8" className="p-3 text-center text-gray-400">
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

export default Album;