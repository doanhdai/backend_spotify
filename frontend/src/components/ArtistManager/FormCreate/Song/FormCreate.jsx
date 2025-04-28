import axios from "axios"; // thêm dòng này
import { useState } from "react";
import { postArtistSong } from "@/service/apiService";

const FormCreateSong = () => {
    const [song, setSong] = useState({
        name: "",
        listens: 0,
        duration: 0,
        status: 0,
        img: null,
        audio: null,
        album_id: null,
        genres_id: null,
        debut_date: new Date().toISOString(),
        artist_id: localStorage.getItem("id_user"),
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSong((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setSong((prev) => ({
            ...prev,
            [name]: files[0],
        }));
    };

    const handleSubmit = async () => {
        if (song.name.length == 0) {
            alert('Tên bài hát không được để trống !')
            return;
        }

        const formData = new FormData();
        formData.append("ten_bai_hat", song.name);
        formData.append("trang_thai", song.status);
        formData.append("hinh_anh", song.img);
        formData.append("audio", song.audio);
        formData.append("luot_nghe", song.listens);
        formData.append("ma_album_id", song.album_id);
        formData.append("ma_user_id", song.artist_id);
        formData.append("ma_the_loai_id", song.genres_id);

        try {
            // const token = localStorage.getItem("access_token");

            // Gửi yêu cầu POST lên server
            const response = await postArtistSong(formData)

            alert('Đã lưu bài hát, chờ kiểm duyệt từ quản trị viên.')
            console.log("Bài hát đã được lưu:", response.data);
        
        } catch (error) {
            console.error("Lỗi khi lưu bài hát:", error);
        }
    };

    return (
        <div className="flex justify-center w-full px-4 bg-white h-full">
            <div className="w-2/3 bg-white shadow-lg p-5">
                <h1 className="text-2xl font-bold text-black mb-4">Thêm Bài Hát Mới</h1>

                {error && <p className="text-red-500 mb-3">{error}</p>}

                <input
                    name="name"
                    className="w-full p-3 mb-3 bg-gray-100 text-black placeholder-gray-400 rounded"
                    placeholder="Tên bài hát"
                    value={song.name}
                    onChange={handleChange}
                />

                <label className="block text-black mb-1">Ảnh bìa</label>
                <input
                    name="cover"
                    className="w-full p-3 mb-3 bg-gray-100 text-black rounded"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <label className="block text-black mb-1">File nhạc</label>
                <input
                    name="file"
                    className="w-full p-3 mb-4 bg-gray-100 text-black rounded"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                />

                <button
                    className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-500 cursor-pointer"
                    onClick={handleSubmit}
                >
                    Thêm Bài Hát
                </button>
            </div>
        </div>
    );
};

export default FormCreateSong;
