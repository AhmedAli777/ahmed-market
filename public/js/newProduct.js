/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const addNewProduct = async (
  name,
  price,
  category,
  subCategory,
  summary,
  description,
  vendorId
) => {
  try {
    const url = '/api/v1/products/';

    const res = await axios({
      method: 'POST',
      url,
      data: {
        name,
        price,
        category,
        subCategory,
        summary,
        description,
        vendor: vendorId,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', `${name.toUpperCase()} Added successfully!`);
    }
  } catch (err) {
    showAlert('error', err);
  }
};
