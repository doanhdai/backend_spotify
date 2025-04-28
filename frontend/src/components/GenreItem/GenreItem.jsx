import { Link } from 'react-router-dom';
import config from '@/configs';

function GenreItem(props) {
    return (
        <Link to={props.link}>
            <div className="w-[290px] h-[174px] p-3 px-2">
                <div
                    style={{ backgroundColor: props.bgColor }} // Sử dụng inline styles cho màu động
                    className="h-full rounded-lg relative overflow-hidden"
                >
                    <h1 className="font-bold text-white text-2xl p-4 w-40">{props.name}</h1>
                    <img
                        className="absolute right-0 bottom-0 w-[42%] rounded shadow-md rotate-[25deg] translate-x-[18%] translate-y-[-2%]"
                        src={props.image}
                        alt=""
                    />
                </div>
            </div>
        </Link>
    );
}

export default GenreItem;
