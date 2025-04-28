import { useEffect, useState } from "react";
import { getAllPremium } from "@/service/apiService";

const Premium = () => {
  const [premiums, setPremiums] = useState([]);

  const fetchAllPremium = async () => {
    try {
      const respone = await getAllPremium();
      const data = respone.data;
      setPremiums(data);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchAllPremium();
  }, [])

  return (
    <div className="w-full p-6 bg-gray-800">
      <h2 className="text-2xl font-bold mb-4">Danh sách gói premium</h2>
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-600">
            <tr>
              <th className="p-3 text-left">Mã gói</th>
              <th className="p-3 text-left">Tên gói</th>
              <th className="p-3 text-left">Thời gian sử dụng</th>
              <th className="p-3 text-left">Giá gói</th>
              <th className="p-3 text-left">Mô tả</th>
              <th className="p-3 text-left">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {premiums.length > 0 ? (
              premiums.map((premium, item) => (
                <tr key={premium.ma_premium}>
                  <td className="p-3 text-left">{premium.ma_premium}</td>
                  <td className="p-3 text-left">{premium.ten_premium}</td>
                  <td className="p-3 text-left">{premium.thoi_han}</td>
                  <td className="p-3 text-left">{premium.gia_ban}</td>
                  <td className="p-3 text-left">{premium.mo_ta}</td>
                  <td className="p-3 text-left">{premium.trang_thai === 1 ? "Đang phát hành" : "Vô hiệu hoá"}</td>
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
export default Premium;