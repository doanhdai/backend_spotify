import Footer from '@/layouts/components/Footer';
import { getCategory } from '@/service/apiService';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Category() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    // Mảng màu nền cố định
    const backgroundColors = [
        'bg-[#1e3a8a]', // xanh navy
        'bg-[#7c3aed]', // tím
        'bg-[#dc2626]', // đỏ
        'bg-[#059669]', // xanh lá
        'bg-[#ca8a04]', // vàng đậm
        'bg-[#0ea5e9]', // xanh dương
        'bg-[#9333ea]', // tím đậm
        'bg-[#f97316]', // cam
    ];

    const fetchCategory = async () => {
        try {
            const response = await getCategory();
            if (response && response.data) {
                setCategories(response.data);
                console.log(response.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, []);

    const handleCategoryClick = (genreId) => {
        navigate(`/category/${genreId}`);
    };

    return (
        <div className="bg-[#121212] w-[79%] h-[97.4%] rounded-xl my-2 mr-2 py-4 pt-0 overflow-hidden overflow-y-auto">
            <div className="px-8">
                <h2 className="text-white text-2xl font-bold mb-4">Thể loại</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map((category, index) => {
                        const bgColor = backgroundColors[index % backgroundColors.length];
                        return (
                            <div
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`relative ${bgColor} h-40 rounded-xl flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity overflow-hidden p-4`}
                            >
                                {/* Tên thể loại bên trái */}
                                <h3 className="text-white text-2xl font-bold z-10">{category.ten_the_loai}</h3>

                                {/* Ảnh nghiêng bên phải */}
                                <img
                                    src={category.hinh_anh}
                                    alt={category.ten_the_loai}
                                    className="absolute right-[-20px] bottom-[-20px] w-28 h-28 object-cover rotate-[25deg] rounded-lg shadow-lg"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Category;
