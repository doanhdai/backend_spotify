import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: false,
    token: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action) {
            state.isLoggedIn = true;
            state.token = action.payload;
            localStorage.setItem('access_token', action.payload);
        },
        logout(state) {
            state.isLoggedIn = false;
            state.token = null;
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        },
        initializeAuth(state) {
            const token = localStorage.getItem('access_token');
            if (token) {
                state.isLoggedIn = true;
                state.token = token;
            }
        }
    },
});

export const { login, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;