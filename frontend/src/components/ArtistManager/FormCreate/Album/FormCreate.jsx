import { useState, useEffect } from "react";
import { Trash, Plus } from "lucide-react";
import { getArtistSong, postArtistAlbum } from "@/service/apiService";

const FormCreate = () => {
    const [songs, setSongs] = useState([]);
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [album, setAlbum] = useState({
        name: "",
        img: null,
        songs: [],
        created_at: new Date().toISOString(),
        status: 0,
        user_id: localStorage.getItem("id_user"),
    });

    useEffect(() => {
        const fetchAllSongs = async () => {
            try {
                const response = await getArtistSong(localStorage.getItem("id_user"));
                setSongs(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách bài hát:", error);
            }
        };
        fetchAllSongs();
    }, []);

    const handleAlbumChange = (e) => {
        const { name, type, value, files } = e.target;
        if (type === "file") {
            const file = files[0];
            console.log("Ảnh đã chọn:", file);
            setAlbum((prev) => ({ ...prev, img: file }));
        } else {
            setAlbum((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleAddSelectedSongs = () => {
        const newSongs = songs.filter((song) => selectedSongs.includes(song.ma_bai_hat));
        setAlbum((prev) => ({
            ...prev,
            songs: [...prev.songs, ...newSongs],
        }));
        setSelectedSongs([]);
    };

    const toggleSelectSong = (songId) => {
        setSelectedSongs((prev) =>
            prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
        );
    };

    const handleRemoveSong = (index) => {
        setAlbum((prev) => ({
            ...prev,
            songs: prev.songs.filter((_, i) => i !== index),
        }));
    };

    const submitFormAlbum = async () => {
        if (!album.name.trim()) {
            alert("Tên album không được để trống!");
            return;
        }

        if (!album.img) {
            alert("Bạn cần chọn ảnh cho album!");
            return;
        }

        const formData = new FormData();
        formData.append("ten_album", album.name);
        formData.append("hinh_anh", album.img);
        formData.append("ngay_tao", album.created_at);
        formData.append("trang_thai", album.status);
        formData.append("ma_user_id", album.user_id);

        console.log("Gửi album:", {
            ...album,
            songs: album.songs.map((s) => s.ten_bai_hat),
        });

        try {
            const response = await postArtistAlbum(formData);
            alert("Đã lưu album, chờ kiểm duyệt từ quản trị viên.");
            console.log(album.img)
            console.log("Album đã được lưu:", response.data);
        } catch (error) {
            console.error("Lỗi khi lưu album:", error);
            alert("Lỗi khi lưu album. Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="flex w-full px-4 bg-white h-full">
            {/* Form tạo album */}
            <div className="w-2/3 bg-white shadow-lg p-6">
                <h1 className="text-2xl font-bold text-black mb-4">Tạo Album Mới</h1>

                <input
                    className="w-full p-3 mb-3 bg-gray-100 text-black placeholder-gray-400 rounded"
                    placeholder="Tên album"
                    name="name"
                    value={album.name}
                    onChange={handleAlbumChange}
                />

                <input
                    className="w-full p-3 mb-3 bg-gray-100 text-black rounded"
                    type="file"
                    name="img"
                    accept="/*"
                    onChange={handleAlbumChange}
                />

                {/* Hiển thị ảnh đã chọn */}
                {album.img && (
                    <div className="mb-3">
                        <img
                            src={URL.createObjectURL(album.img)}
                            alt="Preview"
                            className="w-32 h-32 rounded object-cover"
                        />
                    </div>
                )}

                <h2 className="text-lg font-semibold mb-2">Bài hát đã chọn</h2>
                <div className="max-h-64 overflow-y-auto">
                    {album.songs.length > 0 ? (
                        album.songs.map((song, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-gray-200 p-3 rounded-lg mb-2"
                            >
                                <span className="text-black">{song.ten_bai_hat}</span>
                                <button onClick={() => handleRemoveSong(index)} className="text-red-500">
                                    <Trash size={20} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400">Chưa có bài hát nào được chọn.</p>
                    )}
                </div>

                <button
                    className="mt-4 w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-500"
                    onClick={submitFormAlbum}
                >
                    Lưu Album
                </button>
            </div>

            {/* Danh sách bài hát */}
            <div className="w-1/3 bg-white shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 text-black">Danh sách bài hát</h2>
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                    {songs.length > 0 ? (
                        songs.map((song) => (
                            <div
                                key={song.ma_bai_hat}
                                className={`flex items-center gap-3 p-3 rounded-lg shadow cursor-pointer ${
                                    selectedSongs.includes(song.ma_bai_hat)
                                        ? "bg-blue-200"
                                        : "bg-cyan-900"
                                }`}
                                onClick={() => toggleSelectSong(song.ma_bai_hat)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSongs.includes(song.ma_bai_hat)}
                                    onChange={() => toggleSelectSong(song.ma_bai_hat)}
                                />
                                <img
                                    src={song.hinh_anh}
                                    alt="Bài hát"
                                    className="w-12 h-12 rounded"
                                />
                                <div>
                                    <p className="font-semibold text-white">{song.ten_bai_hat}</p>
                                    <p className="text-sm text-white">{song.ngay_phat_hanh}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400">Không có dữ liệu.</p>
                    )}
                </div>
                <button
                    className="mt-4 w-full bg-gray-500 text-white font-bold py-3 rounded hover:bg-gray-600"
                    onClick={handleAddSelectedSongs}
                    disabled={selectedSongs.length === 0}
                >
                    Thêm vào album
                </button>
            </div>
        </div>
    );
};

export default FormCreate;
