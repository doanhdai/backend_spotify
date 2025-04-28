import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useSelector, useDispatch } from 'react-redux';
import { IoClose } from 'react-icons/io5';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAllSongs } from '@/service/apiService';
import { setCurrentPlaylist } from '@/redux/Reducer/playerSlice';

const VideoPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentPlaylist } = useSelector((state) => state.player);
    const [videoUrl, setVideoUrl] = useState('');
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log(currentPlaylist);
    useEffect(() => {
        const fetchSongs = async () => {
            try {
                setLoading(true);
                const response = await getAllSongs();
                const songs = response.data;

                const videoSongs = songs.filter((song) => song.video);
                dispatch(setCurrentPlaylist(videoSongs));
            } catch (err) {
                setError('Không thể tải danh sách bài hát. Vui lòng thử lại sau.');
                console.error('Error fetching songs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, [dispatch]);

    // Lọc danh sách bài hát có video từ currentPlaylist
    const videoTracks = currentPlaylist.filter((item) => item.video);

    // Cập nhật videoUrl và selectedTrack dựa trên id
    useEffect(() => {
        if (currentPlaylist.length === 0) return;

        // Tìm track tương ứng với id trong currentPlaylist
        const track = currentPlaylist.find((item) => item.id.toString() === id);

        if (track && track.video) {
            setSelectedTrack(track);
            setVideoUrl(track.video);
        } else if (videoTracks.length > 0) {
            // Nếu không tìm thấy track hoặc track không có video, chọn track đầu tiên có video
            const firstVideoTrack = videoTracks[0];
            setSelectedTrack(firstVideoTrack);
            setVideoUrl(firstVideoTrack.video);
            navigate(`/video/${firstVideoTrack.id}`);
        }
    }, [id, currentPlaylist, videoTracks, navigate]);

    const handleTrackSelect = (track) => {
        setSelectedTrack(track);
        setVideoUrl(track.video);
        navigate(`/video/${track.id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <p>Đang tải danh sách bài hát...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <p>{error}</p>
            </div>
        );
    }

    if (!videoUrl) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <p>Không có video để phát. Vui lòng chọn một bài hát có video.</p>
            </div>
        );
    }

    return (
        <div className="flex bg-black text-white w-[79%] h-full rounded-xl mr-2 py-4">
            <div className="flex-1 px-4">
                <div className="relative w-full aspect-video">
                    <ReactPlayer
                        url={videoUrl}
                        width="100%"
                        height="100%"
                        controls
                        playing={true}
                        key={videoUrl}
                        config={{
                            youtube: {
                                playerVars: {
                                    showinfo: 1,
                                    quality: 'hd1080', // Ưu tiên chất lượng 1080p
                                    vq: 'hd1080', // Một cách khác để yêu cầu chất lượng cao
                                },
                            },
                        }}
                    />
                </div>
                <div className="mt-4">
                    <h2 className="text-xl font-bold">{selectedTrack?.ten_bai_hat}</h2>
                    <p className="text-gray-400">{selectedTrack?.ma_user?.name}</p>
                </div>
            </div>

            <div className="w-80 bg-[#121212] p-4 overflow-y-auto rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Danh Sách Phát</h3>
                <div className="space-y-4">
                    {videoTracks.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => handleTrackSelect(item)}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-800 ${
                                selectedTrack?.id === item.id ? 'bg-[#1f1f1f]' : ''
                            }`}
                        >
                            <img
                                src={item.hinh_anh}
                                alt={item.ten_bai_hat}
                                className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                                <p className="font-medium">{item.ten_bai_hat}</p>
                                <p className="text-sm text-gray-400">{item.ma_user?.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VideoPage;
