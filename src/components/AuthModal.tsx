import React, { useState } from 'react';
import { X, Github } from 'lucide-react';
import { login, register } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSwitchMode: () => void;
  onAuthSuccess: (token: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSwitchMode,
  onAuthSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        await register(email, password);
        // After registration, automatically log in
        const token = await login(email, password);
        onAuthSuccess(token);
      } else {
        const token = await login(email, password);
        onAuthSuccess(token);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md p-6 bg-gray-900 rounded-lg border border-cyan-500/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-cyan-500/10 transition-colors"
        >
          <X className="w-5 h-5 text-cyan-400" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === 'login' ? 'Welcome Back' : 'Join OpenWorld'}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-cyan-500/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-cyan-500/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-md bg-cyan-500 hover:bg-cyan-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-all font-medium flex items-center justify-center space-x-2 border border-gray-700"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </button>

          <p className="text-center text-sm">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={onSwitchMode}
              className="text-cyan-400 hover:text-cyan-300"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;