/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const addNewProduct = async (data) => {
  try {
    const url = '/api/v1/products/';

    const res = await axios({
      method: 'POST',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Added successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
