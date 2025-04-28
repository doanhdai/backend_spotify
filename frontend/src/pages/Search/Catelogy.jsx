import Footer from '@/layouts/components/Footer';
import { getCategory } from '@/service/apiService';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Category() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    const fetchCategory = async () => {
        try {
            const response = await getCategory();

            if (response && response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, []);

    const handleCategoryClick = (genreId) => {
        navigate(`/search?genre=${genreId}`);
    };

    return (
        <>
            {' '}
            <div className="bg-[#121212] w-[79%] h-[97.4%] rounded-xl my-2 mr-2 py-4 pt-0 overflow-hidden overflow-y-auto">
                <div className="px-8">
                    <h2 className="text-white text-2xl font-bold mb-4">Thể loại</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`${category.color} p-4 rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}
                            >
                                <img
                                    src={category.image}
                                    alt={category.ten_the_loai}
                                    className="w-full aspect-square object-cover rounded-md mb-3"
                                />
                                <h3 className="text-white font-bold">{category.ten_the_loai}</h3>
                            </div>
                        ))}
                    </div>
                </div>
              
            </div>
        </>
    );
}

export default Category;
