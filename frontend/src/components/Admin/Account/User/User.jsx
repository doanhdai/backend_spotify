import { useEffect, useState } from "react";
import { getAllUser } from "@/service/apiService";

const User = () => {
  const [users, setUsers] = useState([]);

  const fetchAllUsers = async () => {
    try {
      const response = await getAllUser();
      const data = response.data;
      setUsers(data);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchAllUsers();
  }, [])

  return (
    <div className="w-full p-6 bg-gray-800">
      <h2 className="text-2xl font-bold mb-4">Danh sách tài khoản</h2>
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-600">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Tên người dùng</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Ảnh đại diện</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="p-3 text-left">{user.id}</td>
                  <td className="p-3 text-left">{user.name}</td>
                  <td className="p-3 text-left">{user.email}</td>
                  <td className="p-3 text-left">
                    <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded" />
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

export default User;