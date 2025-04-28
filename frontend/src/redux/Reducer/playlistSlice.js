import { createSlice } from '@reduxjs/toolkit';

const playlistSlice = createSlice({
    name: 'playlists',
    initialState: {
        playlists: [],
    },
    reducers: {
        setPlaylists: (state, action) => {
            state.playlists = action.payload;
        },
    },
});

export const { setPlaylists } = playlistSlice.actions;
export default playlistSlice.reducer;