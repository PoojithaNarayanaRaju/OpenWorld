const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  id: number;
  email: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  stars: number;
  contributors: number;
  creator_email: string;
}

export async function login(email: string, password: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  return data.token;
}

export async function register(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
}

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_URL}/api/projects`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  return response.json();
}

export async function createProject(
  token: string,
  project: { title: string; description: string; tags: string[] }
): Promise<void> {
  const response = await fetch(`${API_URL}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(project),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create project');
  }
}

export async function starProject(token: string, projectId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/projects/${projectId}/star`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to star project');
  }
}