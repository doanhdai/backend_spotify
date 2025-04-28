import { Link } from 'react-router-dom';
import config from '@/configs';

function Album(props) {
    return (
        <div className="flex flex-col w-full aspect-[3/4] p-2 rounded cursor-pointer hover:bg-[#ffffff26]">
            <Link to={config.routes.album + `/${props.id}`}>
                <img className="rounded w-full aspect-square object-cover" src={props.image} alt="" />
            </Link>
            <p className="text-white text-sm font-medium mt-2 line-clamp-2 uppercase">{props.name}</p>
            <p className="text-[#b3b3b3] text-sm font-medium mt-2 line-clamp-2"> {props.artist}</p>
        </div>
    );
}

export default Album;
