import React, { useState, useEffect } from 'react';
import './App.css';
import {
  BrowserRouter,
  Route,
  Routes,
  Outlet,
  Navigate,
} from 'react-router-dom';
import router from '@/router/router';

function App() {
  return (
    <BrowserRouter
    //basename={(window as any).__MICRO_APP_BASE_ROUTE__ || '/gpt'}
    >
      <div className="app">
        <Routes>
          {router.map((item, i) => {
            return (
              <Route key={i} path={item.path} Component={item.component} />
            );
          })}
        </Routes>
        <Outlet></Outlet>
      </div>
    </BrowserRouter>
  );
}

export default App;
