import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllPremium, getPremiumDetail } from "@/service/apiService";

const PurchasedPremiumCard = ({ title, price, duration, descriptions, package_id }) => {
    const navigate = useNavigate();

    const handleBuyClick = () => {
        navigate(`/premium/register/${package_id}/`);

    };

    return (
        <div className='mb-6 w-full max-w-sm bg-gray-800 text-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105'>
            <div className="relative bg-gradient-to-r from-green-400 to-blue-500 p-4 text-center font-bold text-black">
                <span className="text-lg">{title}</span>
            </div>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
                <p className="text-center text-lg font-semibold text-green-400">{price} / {duration}</p>
                <p className="text-center text-lg font-semibold text-green-400">{descriptions}</p>
                <div className="mt-6 text-center">
                    <button
                        onClick={handleBuyClick}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-all">
                        Đăng ký ngay
                    </button>
                </div>
            </div>
        </div>
    );
};

const PremiumSection = () => {
    const [premium, setPremium] = useState([]);

    const fetchAllPremium = async () => {
        try {
            const respone = await getAllPremium();
            const data = respone.data;
            setPremium(data);
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchAllPremium();
    }, [])

    return (
        <div className="bg-black w-full h-100 px-2 py-2">
            <div className="w-full bg-[#141414] rounded-xl">
                <div className="flex flex-col justify-center rounded-xl"
                    style={{ backgroundImage: 'linear-gradient(to bottom, #141414 9%, #590F33 30%, #9C0B50 48%, #521030 72%, #141414 90%)', height: "250px" }}>
                    <h1 className="text-3xl ml-10 font-bold mb-3 text-white">Khám phá premium</h1>
                    <p className="text-lg ml-10 text-gray-300">Tận hưởng âm nhạc không bị gián đoạn, cùng nhiều lợi ích khác!</p>
                </div>

                <div className="flex justify-around">
                    {premium.map((item, index) => (
                        <PurchasedPremiumCard
                            key={index}
                            package_id={item.ma_premium}
                            title={item.ten_premium}
                            price={item.gia_ban}
                            duration={`${item.thoi_han}`}
                            descriptions={item.mo_ta ? item.mo_ta : []}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PremiumSection;
