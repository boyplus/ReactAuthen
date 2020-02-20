import { SIGN_IN, SIGN_IN_TOKEN } from './types';
import jpc from '../apis/index';
export const signIn = (email, password) => async dispatch => {
    const response = await jpc.post('/api/signin', {
        email: email,
        password: password
    });
    window.localStorage.setItem('token', response.headers.token);
    dispatch({ type: SIGN_IN, payload: response.data });
};
export const signInWithToken = token => async dispatch => {
    const response = await jpc.get('/api/user', {
        headers: {
            token: token
        }
    });
    dispatch({ type: SIGN_IN_TOKEN, payload: response.data });
};
