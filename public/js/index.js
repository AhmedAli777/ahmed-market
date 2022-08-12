/* eslint-disable */
import '@babel/polyfill';
import { sign } from 'jsonwebtoken';
import { displayMap } from './leaflet';
import { login, logout, signup } from './login';
import { updateSettings } from './updateSettings';
import { bookProduct } from './stripe';
import { showAlert } from './alerts';
import { addNewProduct } from './newProduct';

// DOM ELEMENTS
const leaflet = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const newProduct = document.querySelector('.form--newProduct');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-product');

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
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('price', document.getElementById('price').value);
    form.append('category', document.getElementById('category').value);
    form.append('subCategory', document.getElementById('subCategory').value);
    form.append('summary', document.getElementById('summary').value);
    form.append('description', document.getElementById('description').value);

    form.append('coverImage', document.getElementById('coverImage').files[0]);
    form.append('image1', document.getElementById('image1').files[0]);
    form.append('image2', document.getElementById('image2').files[0]);
    form.append('image3', document.getElementById('image3').files[0]);

    addNewProduct(form);
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

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { productId } = e.target.dataset;
    bookProduct(productId);
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
