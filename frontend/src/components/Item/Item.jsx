import { Link } from 'react-router-dom';
import config from '@/configs';

function Item(props) {
<<<<<<< HEAD
<<<<<<< HEAD
    const is_premium = localStorage.getItem('is_premium');

    return (
        <div className="flex flex-col w-full aspect-[3/4] p-2 rounded cursor-pointer hover:bg-[#ffffff26] relative">
            <Link to={config.routes.detailSong + `/${props.id}`}>
                <img className="rounded w-full aspect-square object-cover" src={props.image} alt={props.name} />
                {props.premium && (
                    <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                        PREMIUM
                    </span>
                )}
            </Link>
            <p className="text-white text-sm font-medium mt-2 line-clamp-2 uppercase">{props.name}</p>
            <p className="text-[#b3b3b3] text-sm font-medium mt-2 line-clamp-2">{props.artist}</p>
=======
=======
>>>>>>> 9f9620225d58d73e172f6fa0d40d66304c31eac9
    return (
        <div className="flex flex-col w-full aspect-[3/4] p-2 rounded cursor-pointer hover:bg-[#ffffff26]">
            <Link to={config.routes.detailSong + `/${props.id}`}>
                <img className="rounded w-full aspect-square object-cover" src={props.image} alt="" />
            </Link>
            <p className="text-white text-sm font-medium mt-2 line-clamp-2 uppercase">{props.name}</p>
            <p className="text-[#b3b3b3] text-sm font-medium mt-2 line-clamp-2"> {props.artist}</p>
<<<<<<< HEAD
>>>>>>> 9f9620225d58d73e172f6fa0d40d66304c31eac9
=======
>>>>>>> 9f9620225d58d73e172f6fa0d40d66304c31eac9
        </div>
    );
}

export default Item;
