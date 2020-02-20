import axios from 'axios';
export default axios.create({
    baseURL: 'http://stockserver.azurewebsites.net/'
});
