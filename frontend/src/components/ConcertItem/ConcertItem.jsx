import { Link } from 'react-router-dom';
import config from '@/configs';

function ConcertItem(props) {
    return (
        <div className="relative flex flex-col w-48 h-72 p-2 sizing rounded-lg cursor-pointer hover:bg-[#ffffff26] group">
            <Link to={config.routes.concerts + `/${props.id}`}>
                <img
                    className="rounded-lg w-full h-auto max-w-[180px] max-h-[180px] object-cover"
                    src={props.image}
                    alt=""
                />
            </Link>
            <p className="text-white font-bold mt-2 group-hover:underline">{props.name}</p>
            <p className="text-[#b3b3b3] text-left text-sm font-medium mt-1 line-clamp-1 group-hover:underline">
                {props.address}
            </p>
            <div className="absolute w-12 h-12 mt-2 ml-2 rounded">
                <div className="absolute inset-0 bg-black opacity-65 rounded" />
                <div className="relative text-white text-[14px] text-center">
                    <div className="mb-[2px]">
                        <span>{props.month}</span>
                    </div>
                    <span className="font-bold">{props.day}</span>
                </div>
            </div>
        </div>
    );
}

export default ConcertItem;
