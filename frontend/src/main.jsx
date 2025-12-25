import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './App.jsx';
import './index.css';
import SEOProvider from './components/SEOProvider';
import axios from 'axios';

// 👇 CORRECT IMPORT: Must match the name in your file exactly!
import { CartProvider } from './context/CartContext'; 
axios.defaults.withCredentials = true;
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <CartProvider>
          {/* 👇 App must be INSIDE SEOProvider */}
          <SEOProvider>
             <App />
          </SEOProvider>
        </CartProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);