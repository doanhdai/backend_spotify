import axios from 'axios';
// import { store } from "../Redux/strore";
// import NProgress from "nprogress";

// NProgress.configure({
//   showSpinner: false,
//   trickleSpeed: 100,
// });
const instance = axios.create({
    baseURL: 'http://localhost:8080',
});

// Add a request interceptor
instance.interceptors.request.use(
    function (config) {
        // const accestoken = store?.getState()?.login.token;
        // config.headers["Authorization"] = "Bearer " + accestoken;

        // NProgress.start();
        // Do something before request is sent

        // const accessToken =
        //   "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkb211b2lnZ2hoQGdtYWlsLmNvbSIsImhvaWRhbml0IjpbIlJPTEVfVVNFUiJdLCJleHAiOjE3NDA1NDI2MTAsImlhdCI6MTc0MDQ1NjIxMH0.8u8gyo3WOtb2cphqCUJ3xYLuY-RWVq52FcQOOw-eeTu9mfDIeC88dJXvi2bQQvaJnfycgFVssCsIlMxSL_NL3Q"; // Thay "your_token_here" bằng token thực tế của bạn
        // config.headers["Authorization"] = `Bearer ${accessToken}`;
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    },
);

// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        // NProgress.done();
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response && response.data ? response.data : response;
    },
    function (error) {
        // NProgress.done();

        // if (error.response) {
        //   //   window.location.href = "/login";
        // }
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return error && error.response ? error.response.data : Promise.reject(error);
    },
);
export default instance;
