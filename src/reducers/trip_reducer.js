import types from '../actions/types';

const DEFAULT_STATE = {
    trips_id: null
};

export default function tripReducer(state = DEFAULT_STATE, action){
    switch(action.type){
        case types.GET_TRIP_ID:
            console.log("Trips_id:", action.trips_id);
            return {
                ...state,
                trips_id: action.trips_id
            };
        case types.CLEAR_TRIP_ID:
            console.log("Trips_ip: null");
            return {
                ...state,
                trips_id: null
            };
        default:
            return state
    }
}