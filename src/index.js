import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { state, persistor } from "./store";

import {Provider} from 'react-redux'
import {PersistGate} from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom';


import axios from 'axios'
axios.defaults.baseURL = 'https://eu-desenvolvo-default-rtdb.firebaseio.com/'



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={state}>
    <PersistGate persistor={persistor} loading={null} >
        <BrowserRouter>
          <App />
        </BrowserRouter> 
    </PersistGate>
  </Provider>

);
reportWebVitals();
