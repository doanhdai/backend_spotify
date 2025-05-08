import { useEffect, useState } from "react";
import { getAlbum, getArtistAlbum } from "@/service/apiService";


const Album = () => {
    const [albums, setAlbums] = useState([]);
    const userId = localStorage.getItem('id_user');

    const fetchAllAlbums = async () => {
        try {
            const response = await getArtistAlbum(userId);
            const data = response.data.albums;
            setAlbums(data);
            console.log(response)
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchAllAlbums();
    }, [])

    return (
        <div className="p-2 w-full text-black bg-white">
            <h2 className="text-2xl font-bold mb-4 ml-3">Danh sách album</h2>
            <div className="bg-white overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">Tên album</th>
                            <th className="p-3 text-left">Ngày tạo</th>
                            <th className="p-3 text-left">Hình ảnh</th>
                            <th className="p-3 text-left">Trạng thái</th>
                        </tr>
                    </thead>

                    <tbody>
                        {albums.length > 0 ? (
                            albums.map((album) => (
                                <tr key={album.ma_album}>
                                    <td className="p-3 text-left">{album.ma_album}</td>
                                    <td className="p-3 text-left">{album.ten_album}</td>
                                    <td className="p-3 text-left">{album.ngay_tao}</td>
                                    <td className="p-3 text-left">
                                        <img src={album.hinh_anh} alt="Album" className="w-12 h-12 rounded" />
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

export default Album;