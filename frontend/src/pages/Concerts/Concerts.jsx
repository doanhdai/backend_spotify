import { useContext, useEffect, useState } from 'react';

import ConcertItem from '@/components/ConcertItem';
import Footer from '@/layouts/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faBookmark, faCalendar } from '@fortawesome/free-regular-svg-icons';

function Concerts() {
    useEffect(() => {
        document.title = 'Concert Tickets & Tour Dates for you in Ho Chi Minh City | Spotify';
    }, []);

    const [isCare, setIsCare] = useState(false);

    const handlerChangeCare = () => {
        setIsCare(!isCare);
    };

    return (
        <div className="bg-gradient-to-b from-[#765cfc] to-[#121212] w-[79%] h-[97.4%] rounded-xl my-2 mr-2 py-4 pt-0 overflow-hidden overflow-y-auto">
            <div className="px-6">
                <h2 className="text-white text-5xl font-bold mb-4 mt-10 md:text-8xl">Sự kiện trực tiếp</h2>
            </div>
            <div className="mt-12 px-6">
                <div className={`flex items-center ${isCare ? 'justify-end' : 'justify-between'}`}>
                    {isCare ? null : (
                        <div className="flex justify-start items-center gap-4">
                            <button className="flex justify-center items-center gap-2 px-2 py-1 border-[1px] border-[#7c7c7c] rounded-full text-white font-bold text-[14px] hover:scale-105 hover:border-white">
                                <FontAwesomeIcon icon={faLocationDot} />
                                <p>Ho Chi Minh City</p>
                            </button>
                            <button className="flex justify-center items-center gap-2 px-2 py-1 border-[1px] border-[#7c7c7c] rounded-full text-white font-bold text-[14px] hover:scale-105 hover:border-white">
                                <FontAwesomeIcon icon={faCalendar} />
                                <p>Chọn khoảng ngày</p>
                            </button>
                            <button className="flex justify-center items-center gap-2 px-2 py-1 bg-[#5f5a76] rounded-full text-white font-bold text-[14px] hover:scale-105 hover:bg-[#78748a]">
                                <p>Cuối tuần này</p>
                            </button>
                            <button className="flex justify-center items-center gap-2 px-2 py-1 bg-[#5f5a76] rounded-full text-white font-bold text-[14px] hover:scale-105 hover:bg-[#78748a]">
                                <p>Cuối tuần sau</p>
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col text-[#b3b3b3] text-[14px] font-bold mt-8">
                        <button className="ml-20 mb-2 hover:scale-105 hover:text-white">
                            <FontAwesomeIcon icon={faList} />
                        </button>
                        {isCare ? (
                            <button
                                className="flex gap-2 items-center bg-[#1ed760] text-black px-5 py-2 mr-2 rounded-full hover:scale-105"
                                onClick={handlerChangeCare}
                            >
                                <FontAwesomeIcon icon={faBookmark} />
                                Quan tâm
                            </button>
                        ) : (
                            <button
                                className="flex gap-2 items-center mr-2 px-5 py-2 hover:scale-105 hover:text-white"
                                onClick={handlerChangeCare}
                            >
                                <FontAwesomeIcon icon={faBookmark} />
                                Quan tâm
                            </button>
                        )}
                    </div>
                </div>
                {isCare ? null : (
                    <div className="flex flex-col items-center gap-1 mt-8">
                        <h1 className="text-2xl text-white font-bold">Đặt địa điểm của bạn</h1>
                        <p className="text-[#b3b3b3]">
                            Việc đặt địa điểm cho phép chúng tôi cho bạn thấy những buổi biểu diễn hay nhất ở gần bạn.
                        </p>
                        <button className="px-8 py-3 bg-[#1ed760] text-black font-bold rounded-full mt-3 hover:scale-105 hover:bg-[#3be477]">
                            Chọn địa điểm
                        </button>
                    </div>
                )}

                {isCare ? null : (
                    <div className="mb-4 mt-8">
                        <div className="flex items-center justify-between text-white mb-2">
                            <h1 className="font-bold text-2xl cursor-pointer">Đề xuất cho bạn</h1>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {concertsData.slice(0, 1).map((item, index) => {
                                const date = new Date(item.date);
                                const day = date.toLocaleDateString('vi-VN', {
                                    day: 'numeric',
                                    timeZone: 'Asia/Ho_Chi_Minh',
                                });
                                const month = date.toLocaleDateString('vi-VN', {
                                    month: 'long',
                                    timeZone: 'Asia/Ho_Chi_Minh',
                                });

                                return (
                                    <ConcertItem
                                        key={index}
                                        id={item._id}
                                        image={item.image}
                                        name={item.name}
                                        address={item.address}
                                        day={day}
                                        month={month}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {isCare ? null : (
                    <div className="mb-4 mt-8">
                        <div className="flex items-center justify-between text-white mb-2">
                            <h1 className="font-bold text-2xl cursor-pointer">Đề xuất cho bạn</h1>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {concertsData.map((item, index) => {
                                const date = new Date(item.date);
                                const day = date.toLocaleDateString('vi-VN', {
                                    day: 'numeric',
                                    timeZone: 'Asia/Ho_Chi_Minh',
                                });
                                const month = date.toLocaleDateString('vi-VN', {
                                    month: 'long',
                                    timeZone: 'Asia/Ho_Chi_Minh',
                                });

                                return (
                                    <ConcertItem
                                        key={index}
                                        id={item._id}
                                        image={item.image}
                                        name={item.name}
                                        address={item.address}
                                        day={day}
                                        month={month}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {isCare ? (
                    <div className="flex flex-col items-center gap-1 mt-8 mb-16">
                        <h1 className="text-2xl text-white font-bold">Bạn quan tâm đến các Sự kiện trực tiếp?</h1>
                        <p className="text-white w-[720px] text-center">
                            Thật dễ dàng để lưu sự kiện trực tiếp mà bạn chú ý. Chỉ cần nhấn vào nút Quan tâm trên trang
                            sự kiện và sự kiện bạn đã chọn sẽ xuất hiện ở đây.
                        </p>
                        <button className="px-8 py-3 bg-transparent text-white font-bold border-[1px] rounded-full mt-3 hover:scale-105">
                            Duyệt xem sự kiện
                        </button>
                    </div>
                ) : null}
            </div>

            {isCare ? (
                <div className="px-6 mt-36 mb-12">
                    <p className="text-[#b3b3b3] text-[12px] font-semibold">
                        Spotify sẽ tính phí hoa hồng liên kết và/hoặc thu phí từ hoạt động bán vé thông qua Trung tâm sự
                        kiện trực tiếp này
                    </p>
                </div>
            ) : null}
            <Footer />
        </div>
    );
}

export default Concerts;
