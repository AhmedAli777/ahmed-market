/* eslint-disable */
import '@babel/polyfill';
import { sign } from 'jsonwebtoken';
import { displayMap } from './leaflet';
import { login, logout, signup } from './login';
import { updateSettings } from './updateSettings';
import { bookProduct } from './stripe';
import { showAlert } from './alerts';
import { addNewProduct } from './newProduct';
import { approveRejectProduct } from './approve-reject';

// DOM ELEMENTS
const leaflet = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const newProduct = document.querySelector('.form--newProduct');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const buyBtn = document.getElementById('buy-product');
const appBtn = document.getElementById('approve-product');
const rejBtn = document.getElementById('reject-product');
const appagain = document.getElementById('approve-again');

// DELEGATION
if (leaflet) {
  // const locations = JSON.parse(mapBox.dataset.locations);
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (signupForm)
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // console.log(form);

    updateSettings(form, 'data');
  });

if (newProduct)
  newProduct.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value;
    const subCategory = document.getElementById('subCategory').value;
    const summary = document.getElementById('summary').value;
    const description = document.getElementById('description').value;
    const { vendorId } = e.target.dataset;

    addNewProduct(
      name,
      price,
      category,
      subCategory,
      summary,
      description,
      vendorId
    );
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (buyBtn)
  buyBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { productId } = e.target.dataset;
    bookProduct(productId);
  });

if (appBtn)
  appBtn.addEventListener('click', (e) => {
    const { productId } = e.target.dataset;
    approveRejectProduct(productId, 'approved');
  });

if (appagain)
  appagain.addEventListener('click', (e) => {
    const { productId } = e.target.dataset;
    approveRejectProduct(productId, 'approved');
  });

if (rejBtn)
  rejBtn.addEventListener('click', (e) => {
    const { productId } = e.target.dataset;
    approveRejectProduct(productId, 'rejected');
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
