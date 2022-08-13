/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const approveRejectProduct = async (productId, type) => {
  try {
    const url = `/api/v1/product/${productId}`;

    const res = await axios({
      method: 'PATCH',
      url,
      data: {
        status: `${type}`,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type} successfully!`);
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
