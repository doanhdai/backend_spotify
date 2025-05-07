import apiClient from '../api/axiosClient';
import axios from 'axios';

const searchArtist = async (query) => {
    const response = await apiClient.get(`/users/artist/search/?keyword=${query}`);
    return response;
};

const searchAlbum = async (query) => {
    const response = await apiClient.get(`/songs/album/search/?keyword=${query}`);
    return response;
};

const getCategory = async (id) => {
    const response = await apiClient.get(`/songs/genres/${id}/songs`);
    return response;
};

export { searchArtist, searchAlbum, getCategory };
