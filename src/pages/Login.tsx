import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_BASE_URL = 'https://sih-crop-backend-3sjd.onrender.com/api/auth';

const LoginRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // New state for registration
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? '/login' : '/register';
    const payload = isLogin ? { email, password } : { username, email, password };

    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      login(response.data.token);
      navigate('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || `Authentication failed. Please check your credentials.`);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(''); // Clear errors when toggling
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
          <p className="text-gray-600 text-sm">Login to access your crop advisory dashboard.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          
          <div>
            <input
              type="email"
              placeholder="Username or Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <a href="#" className="text-blue-500 hover:text-blue-600 text-sm">
                Forgot your password?
              </a>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-gray-500 text-sm mb-4">Or</div>
          <div className="text-sm text-gray-600">
            {isLogin ? 'New to CropWise?' : 'Already have an account?'}
            <button
              onClick={toggleForm}
              className="text-blue-500 hover:text-blue-600 ml-1 font-medium"
            >
              {isLogin ? 'Create an account' : 'Login here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;