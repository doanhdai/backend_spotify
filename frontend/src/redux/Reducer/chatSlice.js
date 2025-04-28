import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    conversations: [],
    group_chats: [],
    currentConversation: null,
    messages: [],
    loading: false,
    error: null,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setConversations: (state, action) => {
            state.conversations = action.payload;
        },
        setCurrentConversation: (state, action) => {
            state.currentConversation = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setGroupChats: (state, action) => {
            state.group_chats = action.payload;
        },
    },
});

export const {
    setConversations,
    setGroupChats,
    setCurrentConversation,
    setMessages,
    addMessage,
    setLoading,
    setError,
} = chatSlice.actions;

export default chatSlice.reducer; 