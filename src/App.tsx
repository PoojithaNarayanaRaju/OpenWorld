import React, { useState, useEffect } from 'react';
import { Monitor, Code2, Users, MessageSquare, Github, ExternalLink, Search, Plus } from 'lucide-react';
import ProjectCard from './components/ProjectCard';
import AuthModal from './components/AuthModal';
import NewProjectModal from './components/NewProjectModal';
import { getProjects, Project, starProject } from './lib/api';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleStarProject = async (projectId: number) => {
    if (!token) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await starProject(token, projectId);
      loadProjects(); // Reload projects to update star count
    } catch (error) {
      console.error('Failed to star project:', error);
    }
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-900 text-cyan-50">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-cyan-900/20 to-blue-900/20 animate-gradient"></div>
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-cyan-500/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Code2 className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                OpenWorld
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {token ? (
                <>
                  <button
                    onClick={() => setIsNewProjectModalOpen(true)}
                    className="px-4 py-2 rounded-md bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/50 transition-all flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New Project</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-md bg-purple-500 hover:bg-purple-600 transition-all"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-16 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 text-transparent bg-clip-text">
              Connect. Create. Contribute.
            </h1>
            <p className="text-xl text-cyan-100/80 mb-8">
              Join the next generation of open-source development
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-8 py-3 rounded-md bg-cyan-500 hover:bg-cyan-600 transition-all flex items-center space-x-2">
                <Github className="w-5 h-5" />
                <span>Start Contributing</span>
              </button>
              <button className="px-8 py-3 rounded-md bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/50 transition-all">
                Explore Projects
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="relative py-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, description, or tags..."
                className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-800 border border-cyan-500/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <section className="relative py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 flex items-center space-x-2">
            <Monitor className="w-6 h-6 text-cyan-400" />
            <span>Explore Projects</span>
          </h2>
          {isLoading ? (
            <div className="text-center py-12">Loading projects...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  tags={project.tags}
                  contributors={project.contributors}
                  stars={project.stars}
                  onStar={() => handleStarProject(project.id)}
                  isAuthenticated={!!token}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={() => setAuthMode(mode => mode === 'login' ? 'signup' : 'login')}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* New Project Modal */}
      {token && (
        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          token={token}
          onProjectCreated={loadProjects}
        />
      )}
    </div>
  );
}

export default App;