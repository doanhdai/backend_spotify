// PaymentSuccess.jsx
import { useEffect } from 'react';

export default function PaymentSuccess() {
    useEffect(() => {}, []);

    return (
        <div className=" p-10 w-full h-full bg-[#121212]">
            <h1 className="text-2xl font-bold text-green-600 text-center">🎉 Thanh toán thành công!</h1>
            <p className="text-center">Cảm ơn bạn đã đăng ký gói Premium.</p>
        </div>
    );
}
