<<<<<<< HEAD
<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPremiumDetail } from '@/service/apiService';
import { createZalopayPayment } from '@/service/paymentService';

const paymentMethods = [
    { id: 'credit_card', name: 'Thẻ tín dụng / Debit' },
    { id: 'zalopay', name: 'Ví điện tử Zalopay' },
    { id: 'bank_transfer', name: 'Chuyển khoản ngân hàng' },
];

const PremiumRegister = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const userId = localStorage.getItem('id_user');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState({});
    const [loading, setLoading] = useState(false); // Thêm trạng thái loading
    const [error, setError] = useState(null); // Thêm trạng thái lỗi

    useEffect(() => {
        const fetchPremiumDetail = async () => {
            try {
                const data = await getPremiumDetail(id);
                setSelectedPlan(data.data);
            } catch (error) {
                console.error('Không thể lấy thông tin gói premium', error);
            }
        };

        if (id) {
            fetchPremiumDetail();
        }
    });

    // useEffect(() => {
    //     fetchManualActivatePremium();
    // }, []);

    // const fetchManualActivatePremium = async () => {
    //     try {
    //         const res = await manual_activate_premium({
    //             user_id: userId,
    //             premium_id: id,
    //         });
    //         if (res.success === true) {
    //             navigate('/premium-payment-success');
    //         } else {
    //             setError('Có lỗi xảy ra khi kích hoạt gói premium. Vui lòng thử lại sau.');
    //         }
    //     } catch (error) {
    //         console.error('Error during payment:', error);
    //     }
    // };

    const handlePaymentSelect = (method) => {
        setSelectedPayment(method);
        setError(null);
    };

    const handlePayment = async () => {
        if (!selectedPayment) {
            setError('Vui lòng chọn phương thức thanh toán!');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (selectedPayment === 'Ví điện tử Zalopay') {
                const res = await createZalopayPayment({
                    user_id: userId,
                    premium_id: id,
                });

                if (res.success === true) {
                    if (res.payUrl) {
                        window.location.href = res.payUrl;
                        localStorage.setItem('is_premium', 'true');
                    } else {
                        setError('Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.');
                    }
                } else {
                    setError('Có lỗi xảy ra khi tạo thanh toán Zalopay. Vui lòng thử lại sau.');
                }
            } else {
                setError(`Bạn đã chọn thanh toán bằng: ${selectedPayment}`);
            }
        } catch (error) {
            console.error('Error during payment:', error);
            setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen py-2">
            <div className="bg-[#141414] h-full rounded-xl text-center text-white py-3">
                <div
                    className="flex flex-col text-left justify-center pt-8"
                    style={{
                        backgroundImage:
                            'linear-gradient(to bottom, #141414 9%, #590F33 30%, #9C0B50 48%, #521030 72%, #141414 90%)',
                        height: '250px',
                    }}
                >
                    <h1 className="text-3xl ml-10 font-bold mb-3 text-white">Thanh toán</h1>
                    <p className="text-lg ml-10 text-gray-300 mb-10">Bạn đang tiến hành thanh toán cho gói premium</p>
                </div>

                <div className="flex flex-col md:flex-row bg-gray-900 px-5 md:px-10 py-5 gap-5">
                    {/* Thông tin gói Premium */}
                    <div className="w-full md:w-2/3 rounded-xl bg-gray-950 px-5 py-5 shadow-lg">
                        {selectedPlan.ten_premium ? (
                            <>
                                <h2 className="text-xl text-center font-bold mb-4">{selectedPlan.ten_premium}</h2>
                                <p className="text-center text-xl font-semibold text-green-400">
                                    Giá gói chỉ {selectedPlan.gia_ban} VND
                                </p>
                                <p className="text-center text-xl font-semibold text-green-400">
                                    Thời hạn sử dụng: {selectedPlan.thoi_han} Ngày
                                </p>
                                <ul className="mt-4 text-gray-300 space-y-2 text-sm">
                                    {selectedPlan.mo_ta?.split(';').map((feature, index) => (
                                        <li key={index} className="flex justify-center items-center space-x-2">
                                            <span className="text-green-400">✔</span>
                                            <span>{feature.trim()}</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <p className="text-center text-red-400">Không tìm thấy gói premium.</p>
                        )}
                    </div>

                    {/* Chọn phương thức thanh toán */}
                    <div className="w-full md:w-1/3 text-white px-5">
                        <h2 className="text-xl text-left font-bold mb-3">Phương thức thanh toán</h2>
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className={`p-3 border rounded-md cursor-pointer ${
                                        selectedPayment === method.name
                                            ? 'border-green-500 bg-green-500'
                                            : 'border-gray-300'
                                    }`}
                                    onClick={() => handlePaymentSelect(method.name)}
                                >
                                    {method.name}
                                </div>
                            ))}
                        </div>

                        {error && <p className="text-red-400 mt-3 text-center">{error}</p>}

                        <div className="flex flex-col gap-3 items-center mt-5">
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className={`w-full md:w-[20rem] bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                            </button>

                            <button
                                onClick={() => navigate('/premium')}
                                className="w-full md:w-[20rem] bg-gray-500 text-white py-2 rounded-md hover:bg-black transition"
                            >
                                Đăng ký gói khác
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
=======
=======
>>>>>>> 9f9620225d58d73e172f6fa0d40d66304c31eac9
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPremiumDetail } from "@/service/apiService";

const paymentMethods = [
  { id: "credit_card", name: "Thẻ tín dụng / Debit" },
  { id: "e_wallet", name: "Ví điện tử (Momo, ZaloPay, PayPal)" },
  { id: "bank_transfer", name: "Chuyển khoản ngân hàng" },
];

const PremiumRegister = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchPremiumDetail = async () => {
      try {
        const data = await getPremiumDetail(id);
        setSelectedPlan(data);
        console.log(data)
      } catch (error) {
        console.error("Không thể lấy thông tin gói premium", error);
      }
    };

    if (id) {
      fetchPremiumDetail();
    }
  }, [id]);

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  const handlePayment = () => {
    if (!selectedPayment) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }
    alert(`Bạn đã chọn thanh toán bằng: ${selectedPayment}`);
    // TODO: Gọi API xử lý thanh toán ở đây nếu cần
  };

  return (
    <div className="w-full h-100 py-2">
      <div className="bg-[#141414] h-full rounded-xl text-center text-white py-3">
        <div
          className="flex flex-col text-left justify-center pt-8"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #141414 9%, #590F33 30%, #9C0B50 48%, #521030 72%, #141414 90%)",
            height: "250px",
          }}
        >
          <h1 className="text-3xl ml-10 font-bold mb-3 text-white">Thanh toán</h1>
          <p className="text-lg ml-10 text-gray-300 mb-10">
            Bạn đang tiến hành thanh toán cho gói premium
          </p>
        </div>

        <div className="flex bg-gray-900 px-10 py-5">
          {/* Thông tin gói Premium */}
          <div className="w-2/3 rounded-xl bg-gray-950 px-5 py-5 shadow-lg max-w-md">
            {selectedPlan ? (
              <>
                <h2 className="text-xl text-center font-bold mb-4">
                  {selectedPlan.ten_premium}
                </h2>
                <p className="text-center text-xl font-semibold text-green-400">
                  Giá gói chỉ {selectedPlan.gia_ban} VND
                </p>
                <p className="text-center text-xl font-semibold text-green-400">
                  Thời hạn sử dụng: {selectedPlan.thoi_han} tháng
                </p>
                <ul className="mt-4 text-gray-300 space-y-2 text-sm">
                  {selectedPlan.mo_ta?.split(";").map((feature, index) => (
                    <li key={index} className="flex justify-center items-center space-x-2">
                      <span className="text-green-400">✔</span>
                      <span>{feature.trim()}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-center text-red-400">Không tìm thấy gói premium.</p>
            )}
          </div>

          {/* Chọn phương thức thanh toán */}
          <div className="w-1/3 text-white px-5">
            <h2 className="text-xl text-left font-bold mb-3">Phương thức thanh toán</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-3 border rounded-md cursor-pointer ${selectedPayment === method.name
                    ? "border-green-500 bg-green-500"
                    : "border-gray-300"
                    }`}
                  onClick={() => handlePaymentSelect(method.name)}
                >
                  {method.name}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 items-center mt-5">
              <button
                onClick={handlePayment}
                className="w-[20rem] bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
              >
                Xác nhận thanh toán
              </button>

              <button
                onClick={() => navigate(`/premium`)}
                className="w-[20rem] bg-gray-500 text-white py-2 rounded-md hover:bg-black transition"
              >
                Đăng ký gói khác
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
>>>>>>> 9f9620225d58d73e172f6fa0d40d66304c31eac9
=======
>>>>>>> 9f9620225d58d73e172f6fa0d40d66304c31eac9
};

export default PremiumRegister;
