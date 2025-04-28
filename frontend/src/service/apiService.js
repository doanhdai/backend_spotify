import { data } from 'react-router-dom';
import apiClient from '../api/axiosClient';
import axios from 'axios';

export const loginUser = async (data) => {
    const response = await apiClient.post('/users/login/', data);
    return response.data;
};

export const refreshToken = async (refreshToken) => {
    const response = await axios.post(`${import.meta.env.VITE_REACT_API}/auth/token/refresh/`, {
        refresh: refreshToken,
    });
    return response.data;
};


/*******************************
 *          GET API
 *******************************/

// GET LIST OF USERS
export const getAllUser = async () => apiClient.get('/users/getAll/'); 

// GET LIST OF ARTISTS
export const getAll = async () => apiClient.get('/users/artist/getAll/');
export const getAllArtist = async () => apiClient.get('/users/artist/getAll/');

// GET LIST OF PLAYLISTS
export const getAllPlaylist = async () => apiClient.get('/songs/playlists/get-all/');

// GET LIST OF SONGS
export const getAllSongs = async () => apiClient.get('/songs/all/');

// GET SONG BY ID
export const getSongById = async (id) => apiClient.get(`/songs/detail/${id}/`);

// GET LIST OF SONGS BY PLAYLIST
export const getSongPlaylist = async (id) => apiClient.get(`/songs/playlists/${id}/songs/`);

// GET LIST OF FAVORITE SONGS
export const getFavoriteSongs = async () => apiClient.get('songs/favorites/list/');

// GET LIST OF SONGS BY ARTIST
export const getArtistSong = async (idArtist) => apiClient.get(`/songs/artist/${idArtist}/`);

// GET LIST OF ALBUMS BY ARTIST
export const getArtistAlbum = async (idArtist) => apiClient.get(`/songs/artist/${idArtist}/`);

// GET SONG BY NAME
export const searchSongsByName = async (query) => apiClient.get(`/songs/search/?keyword=${query}`);

// GET LIST OF ALBUM
export const getAlbum = async () => apiClient.get('/songs/album/all/')

// GET ALBUM DETAILS
export const getAlbumById = async (idAlbum) => apiClient.get(`/songs/album/${idAlbum}/detail/`)

// GET LIST OF GENRES
export const getGenres = async () => apiClient.get('/songs/genres/list/')
export const getCategory = async () => apiClient.get('/songs/genres/list/');

// GET LIST OF PREMIUM
export const getAllPremium = async () => apiClient.get('/premium/list/')

// GET LIST OF CHATS IN A CONVERSATION
export const getChat = async (conversation_id) => apiClient.get(`/conversations/${conversation_id}/messages/`) 

// GET CHAT AI
export const getChatAI = async (message) => apiClient.post('/chat/', { message }); // get chat ai

// GET LIST OF CONVERSATIONS
export const getAllConversation = async () => apiClient.get('/conversations/')

//GET PREMIUM DETAIL
export const getPremiumDetail = async (idPremium) => apiClient.get(`/premium/register/${idPremium}/`)


/*******************************
 *          POST API
 *******************************/

// POST SONG FROM ARTIST
export const postArtistSong = async (data) => apiClient.post('/songs/create/', data)

// POST SONG TO PLAYLIST
export const addSongToPlaylist = async (data) => apiClient.post(`/songs/playlists/add-song/`, data);

// POST FAVORITE SONG
export const addLikeSong = async (data) => apiClient.post(`/songs/favorites/`, data);

// POST ALBUM FROM ARTIST
export const postArtistAlbum = async (data) => apiClient.post('/songs/album/create/', data) 

// POST PLAYLIST FROM ARTIST
export const postArtistPlaylist = async () => apiClient.post('/playlist/') 

// POST PLAYLIST
export const createNewPlaylist = async () => apiClient.post('/songs/playlists/create/');

// POST CONVERSATION
export const createConversation = async (data) => apiClient.post('/conversations/create-chat/', data) 


/*******************************
 *          DELETE API
 *******************************/

// DELETE PLAYLIST 
export const deletePlaylist = async (id) => apiClient.delete(`/songs/playlists/delete/${id}/`);

// DELETE FAVORITE SONG
export const removeLikeSong = async (idSong) => apiClient.delete(`/songs/favorites/${idSong}/`);

// DELETE SONG FROM PLAYLIST
export const removeSongFromPlaylist = async (data) => apiClient.delete(`/songs/playlists/remove-song/`, { data });

/*******************************
 *          PUT API
 *******************************/

export const putSongToAlbum = async (idAlbum) => apiClient.put(`/album/${idAlbum}/add-songs/`);




// PUT GROUP CHAT
export const createGroupChat = async (data) => apiClient.post(`/conversations/create-group/`, data);

export const remove_participant = async (data, id_participant) => apiClient.post(`/conversations/${id_participant}/remove-participants/`, data);

export const add_participant = async (data, id_participant) => apiClient.post(`/conversations/${id_participant}/add-participants/`, data);

export const leaveGroupChat = async (conversationId) => apiClient.post(`/conversations/${conversationId}/leave-group/`);