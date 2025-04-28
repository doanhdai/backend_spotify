import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.jsx';
import i18n from './Utils/i18n';
import './index.css';
import { store } from './redux/store';
import PlayerProvider from './providers/PlayerProvider.jsx';
import AuthInitializer from './redux/Action/AuthInitializer.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <PlayerProvider>
                <AuthInitializer />
                <ToastContainer />
                <App />
            </PlayerProvider>
        </Provider>
    </React.StrictMode>,
);
