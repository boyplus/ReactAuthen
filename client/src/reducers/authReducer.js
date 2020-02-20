import { SIGN_IN, SIGN_IN_TOKEN } from '../actions/types';
const INITIAL_STATE = {
    isSignedIn: null,
    id: null,
    email: null,
    funds: 5000
};
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SIGN_IN:
            const newState = {
                isSignedIn: true,
                id: action.payload._id,
                email: action.payload.email,
                funds: action.payload.funds
            };
            console.log('new state');
            console.log(newState);
            return newState;
        case SIGN_IN_TOKEN:
            const newState2 = {
                isSignedIn: true,
                id: action.payload._id,
                email: action.payload.email,
                funds: action.payload.funds
            };
            console.log('from token');
            console.log(newState2);
            return newState2;
        default:
            return state;
    }
};
