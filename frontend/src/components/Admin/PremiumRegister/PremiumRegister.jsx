const PremiumRegister = () => {
    return (
      <div className="w-full p-6 bg-gray-800">
        <h2 className="text-2xl font-bold mb-4">Danh sách TK đăng ký premium</h2>
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
              <tr>
                <td className="p-3 text-left">USR0001</td>
                <td className="p-3 text-left">ltgiai</td>
                <td className="p-3 text-left">tuangiai52@gmail.com</td>
                <td className="p-3 text-left">truigbeovnamep</td>
                <td className="p-3 text-left">User</td>
                <td className="p-3 text-left">Đang hoạt động</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  export default PremiumRegister;