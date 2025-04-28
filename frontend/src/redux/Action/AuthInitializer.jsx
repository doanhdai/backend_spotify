import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth } from '@/redux/Reducer/authSlice';

function AuthInitializer() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    return null;
}

export default AuthInitializer;
