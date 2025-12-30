// import axios from 'axios';
import { getAuthToken } from './auth';

const API_URL = process.env.REACT_APP_SERVER_URL;

// Simple function to get axios instance with auth header
export const getAxiosConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
};

export default API_URL;
