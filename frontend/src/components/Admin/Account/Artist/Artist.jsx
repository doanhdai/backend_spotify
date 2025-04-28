import { useEffect, useState } from "react";
import { getAllArtist } from "@/service/apiService";

const Artist = () => {
  const [artists, setArtists] = useState([]);

  const fetchAllArtists = async () => {
    try {
      const respond = await getAllArtist();
      const data = respond.data;
      setArtists(data);
      // console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchAllArtists();
  }, [])

  return (
    <div className="w-full p-6 bg-gray-800">
      <h2 className="text-2xl font-bold mb-4">Danh sách nghệ sĩ</h2>
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
            {artists.length > 0 ? (
              artists.map((artist) => (
                <tr key={artist.id}>
                  <td className="p-3 text-left">{artist.id}</td>
                  <td className="p-3 text-left">{artist.name}</td>
                  <td className="p-3 text-left">{artist.name}</td>
                  <td className="p-3 text-left">
                    <img src={artist.avatar} alt="avatar" className="w-12 h-12 rounded" />
                  </td>
                  <td className="p-3 text-left">{artist.name}</td>
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

export default Artist;