import { useNavigate } from 'react-router-dom';
import config from '@/configs';

const PremiumModal = ({ onClose, trackName }) => {
    const navigate = useNavigate();

    const handleNextPremium = () => {
        onClose(); // tắt modal
        navigate(config.routes.premium); // chuyển trang không load lại
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#282828] rounded-lg p-8 w-[400px] text-white">
                <h2 className="text-2xl font-bold mb-4">Premium Required</h2>
                <p className="mb-6">
                    The song "{trackName}" is only available for Premium members. Upgrade to Premium to listen to this
                    and many other exclusive tracks.
                </p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-full text-white hover:scale-105">
                        Cancel
                    </button>
                    <button
                        onClick={handleNextPremium}
                        className="px-6 py-2 rounded-full bg-[#1ed760] text-black font-bold hover:scale-105"
                    >
                        Upgrade to Premium
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumModal;
