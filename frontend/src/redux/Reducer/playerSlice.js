// redux/Reducer/playerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllSongs, getSongById } from '@/service/apiService';

export const fetchAllSongs = createAsyncThunk('player/fetchAllSongs', async () => {
    const response = await getAllSongs();
    return response.data;
});

export const fetchSongDetails = createAsyncThunk('player/fetchSongDetails', async (songId) => {
    const response = await getSongById(songId);
    return response.data;
});

const playerSlice = createSlice({
    name: 'player',
    initialState: {
        songsData: [],
        track: null,
        playStatus: false,
        volume: 0.5,
        time: { currentTime: { second: 0, minute: 0 }, totalTime: { second: 0, minute: 0 } },
        currentPlaylist: [],
        currentIndex: -1,
        status: 'idle',
        error: null,
    },
    reducers: {
        setCurrentPlaylist: (state, action) => {
            state.currentPlaylist = action.payload;
            state.currentIndex = 0;
            state.track = action.payload[0] || null;
        },

        previous: (state) => {
            if (state.currentPlaylist.length > 0 && state.currentIndex > 0) {
                state.currentIndex -= 1;
                state.track = state.currentPlaylist[state.currentIndex];
                state.playStatus = true;
                state.time = { currentTime: { second: 0, minute: 0 }, totalTime: { second: 0, minute: 0 } };
            }
        },

        next: (state) => {
            if (state.currentPlaylist.length > 0 && state.currentIndex < state.currentPlaylist.length - 1) {
                state.currentIndex += 1;
                state.track = state.currentPlaylist[state.currentIndex];
                state.playStatus = true;
                state.time = { currentTime: { second: 0, minute: 0 }, totalTime: { second: 0, minute: 0 } };
            }
        },

        setTrack: (state, action) => {
            state.track = action.payload;
            const index = state.currentPlaylist.findIndex((song) => song.id === action.payload.id);
            state.currentIndex = index !== -1 ? index : 0;
            state.playStatus = true;
        },

        setPlayStatus: (state, action) => {
            state.playStatus = action.payload;
        },

        setTime: (state, action) => {
            state.time = action.payload;
        },

        seekTo: (state, action) => {
            const newTime = action.payload;
            state.time.currentTime = {
                second: Math.floor(newTime % 60),
                minute: Math.floor(newTime / 60),
            };
        },

        setVolume: (state, action) => {
            state.volume = action.payload;
        },
        
        muteVolume: (state) => {
            state.volume = 0;
        },
        playWithId: (state, action) => {
            const songId = action.payload;
            const songIndex = state.currentPlaylist.findIndex((song) => song.id === songId);
            if (songIndex !== -1) {
                state.track = state.currentPlaylist[songIndex];
                state.currentIndex = songIndex;
                state.playStatus = true;
                state.time = { currentTime: { second: 0, minute: 0 }, totalTime: { second: 0, minute: 0 } };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllSongs.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllSongs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.songsData = action.payload;
                state.currentPlaylist = action.payload; // Đồng bộ currentPlaylist với songsData
                if (action.payload.length > 0 && !state.track) {
                    state.track = action.payload[0];
                    state.currentIndex = 0;
                }
            })
            .addCase(fetchSongDetails.fulfilled, (state, action) => {
                state.track = action.payload;
                state.playStatus = true;
                // Cập nhật currentIndex nếu bài hát đã tồn tại trong currentPlaylist
                const index = state.currentPlaylist.findIndex((item) => item.id === action.payload.id);
                state.currentIndex = index !== -1 ? index : 0;
            })
            .addCase(fetchAllSongs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export const {
    setCurrentPlaylist,
    previous,
    next,
    setTrack,
    setPlayStatus,
    setTime,
    seekTo,
    setVolume,
    muteVolume,
    playWithId,
} = playerSlice.actions;

export default playerSlice.reducer;