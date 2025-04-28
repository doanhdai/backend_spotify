import { useEffect, useState } from "react";
import { getGenres } from "@/service/apiService";

const Genre = () => {
  const [genres, setGenres] = useState([]);

  const fetchAllGenres = async () => {
    try {
      const respone = await getGenres();
      const data = respone.data;
      setGenres(data);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchAllGenres();
  }, [])

  return (
    <div className="w-full p-6 bg-gray-800">
      <h2 className="text-2xl font-bold mb-4">Danh sách thể loại</h2>
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-600">
            <tr>
              <th className="p-3 text-left">Mã thể loại</th>
              <th className="p-3 text-left">Tên thể loại</th>
              <th className="p-3 text-left">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {genres.length > 0 ?
              genres.map((genre, item) => (
                <tr key={genre.id}>
                  <td className="p-3 text-left">{genre.id}</td>
                  <td className="p-3 text-left">{genre.ten_the_loai}</td>
                  <td className="p-3 text-left">{genre.status === 'true' ? 'Hiển thị' : 'Vô hiệu hóa'}</td>
                </tr>
              ))
              : <tr>
                <td colSpan="7" className="p-3 text-center text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Genre;