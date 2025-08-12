import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import RestaurantDetail from './pages/RestaurantDetail';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import SearchResults from './pages/SearchResults';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  console.log('AppRoutes - user:', user, 'loading:', loading);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/restaurant/:id" element={<RestaurantDetail />} />
      <Route path="/create-post" element={user ? <CreatePost /> : <Navigate to="/login" />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <AppRoutes />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
