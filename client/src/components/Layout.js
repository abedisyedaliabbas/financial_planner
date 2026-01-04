import React from 'react';
import Navbar from './Navbar';
import TextSizeControl from './TextSizeControl';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        {children}
      </div>
      <TextSizeControl />
    </div>
  );
};

export default Layout;

