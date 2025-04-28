import { useEffect, useState } from "react";
import { getAlbum } from "@/service/apiService";

const Album = () => {
  const [albums, setAlbums] = useState([]);

  const fetchAllAlbums = async () => {
    try {
      const respone = await getAlbum();
      const data = respone.data;
      setAlbums(data);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchAllAlbums();
  }, [])

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
              </tr>
            </thead>

            <tbody>
              {albums.length > 0 ?
                albums.map((album) => (
                  <tr key={album.ma_album}>
                    <td className="p-3 text-left">{album.ma_album}</td>
                    <td className="p-3 text-left">{album.ma_user.name}</td>
                    <td className="p-3 text-left">{album.ten_album}</td>
                    <td className="p-3 text-left">{album.ngay_tao}</td>
                    <td className="p-3 text-left">10</td>
                    <td className="p-3 text-left">
                      <img src={album.hinh_anh} alt="avatar" className="w-12 h-12 rounded" />
                    </td>
                    <td className="p-3 text-left">{album.trang_thai == 1 ? "Đang hiển thị" : "Vô hiệu hóa"}</td>
                  </tr>
                ))
                : (
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
  )
}

export default Album;