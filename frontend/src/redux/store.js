import { configureStore } from '@reduxjs/toolkit';
import appReducer from './Reducer/appReducer';
import authReducer from './Reducer/authSlice';
import playerReducer from './Reducer/playerSlice';
import playlistReducer from './Reducer/playlistSlice';
import chatReducer from './Reducer/chatSlice';

export const store = configureStore({
    reducer: {
        app: appReducer,  
        auth: authReducer,
        player: playerReducer,
        playlist: playlistReducer,
        chat: chatReducer,
    },
});