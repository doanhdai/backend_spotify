import apiClient from '../api/axiosClient';
import axios from 'axios';

const createZalopayPayment = async (data) => {
    const response = await apiClient.post('/zalopay/create/', data);
    return response.data;
};

export { createZalopayPayment };
