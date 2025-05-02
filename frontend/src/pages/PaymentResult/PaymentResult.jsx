import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const resultCode = queryParams.get('resultCode');
        const orderId = queryParams.get('orderId');

        if (resultCode === '0') {
            setStatus('success');
            // TODO: Cập nhật trạng thái premium cho user
            setTimeout(() => {
                navigate('/premium');
            }, 3000);
        } else {
            setStatus('failed');
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
            <div className="bg-[#282828] p-8 rounded-lg text-center">
                {status === 'processing' && (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-4">Đang xử lý thanh toán</h2>
                        <p className="text-gray-300">Vui lòng đợi trong giây lát...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <h2 className="text-2xl font-bold text-green-500 mb-4">Thanh toán thành công!</h2>
                        <p className="text-gray-300">Cảm ơn bạn đã đăng ký Premium.</p>
                        <p className="text-gray-300">Bạn sẽ được chuyển hướng trong giây lát...</p>
                    </>
                )}
                {status === 'failed' && (
                    <>
                        <h2 className="text-2xl font-bold text-red-500 mb-4">Thanh toán thất bại</h2>
                        <p className="text-gray-300">Có lỗi xảy ra trong quá trình thanh toán.</p>
                        <button
                            onClick={() => navigate('/premium')}
                            className="mt-4 bg-[#1ed760] text-black px-6 py-2 rounded-full font-bold hover:bg-[#3be477] hover:scale-105"
                        >
                            Quay lại
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentResult;
