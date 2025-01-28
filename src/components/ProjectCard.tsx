import React from 'react';
import { Star, Users, ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  contributors: number;
  stars: number;
  onStar?: () => void;
  isAuthenticated?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  tags,
  contributors,
  stars,
  onStar,
  isAuthenticated
}) => {
  return (
    <div className="relative group">
      {/* Animated border gradient */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
      
      <div className="relative p-6 bg-gray-900 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-cyan-50">{title}</h3>
          <button className="p-2 rounded-full hover:bg-cyan-500/10 transition-colors">
            <ArrowUpRight className="w-5 h-5 text-cyan-400" />
          </button>
        </div>
        
        <p className="text-cyan-100/70 mb-4">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-cyan-100/70">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{contributors}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{stars}</span>
            </div>
          </div>
          
          {isAuthenticated && onStar && (
            <button
              onClick={onStar}
              className="px-3 py-1 rounded-md bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm flex items-center space-x-1 transition-all"
            >
              <Star className="w-4 h-4" />
              <span>Star</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;