import { getCategory } from '@/service/UserAPI';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DetailCategory = () => {
    const { id } = useParams();
    const [category, setCategory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategory = async () => {
            const response = await getCategory(id);
            setCategory(response.data);
        };
        fetchCategory();
    }, [id]);

    return (
        <div className="w-full h-full bg-[#121212] text-white overflow-y-auto rounded-xl p-4">
            {/* Banner Header */}
            <div className="bg-gradient-to-b from-[#1e3a8a] to-[#121212] rounded-xl p-8 mb-6">
                {category[0] && <h1 className="text-5xl font-bold mb-2">{category[0].ma_the_loai.ten_the_loai}</h1>}
            </div>

            {/* Section Title */}
            <div className="flex justify-between items-center px-4 mb-4">
                {category[0] && (
                    <h2 className="text-xl font-semibold">{category[0].ma_the_loai.ten_the_loai} Thịnh Hành </h2>
                )}
            </div>

            {/* Playlist Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
                {category.length > 0 ? (
                    category.map((item) => (
                        <div
                            key={item.id}
                            className="bg-[#181818] hover:bg-[#282828] rounded-lg p-4 cursor-pointer transition-all"
                            onClick={() => {
                                navigate(`/song/${item.id}`);
                            }}
                        >
                            <img
                                src={item.hinh_anh}
                                alt={item.ten_the_loai}
                                className="w-full h-44 object-cover rounded-lg mb-3"
                            />
                            <h3 className="text-base font-bold mb-1">{item.ten_bai_hat}</h3>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 col-span-full text-center text-lg">Thể loại này chưa có bài hát nào.</p>
                )}
            </div>
        </div>
    );
};

export default DetailCategory;
