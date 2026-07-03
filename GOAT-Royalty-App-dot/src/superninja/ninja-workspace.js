/**
 * NINJA WORKSPACE MANAGER
 * Advanced project and session management
 * Created by SuperNinja - NinjaTech AI
 */

const fs = require('fs').promises;
const path = require('path');

class NinjaWorkspace {
  constructor() {
    this.currentProject = null;
    this.activeSessions = new Map();
    this.projectTemplates = new Map();
    this.workspacePreferences = {
      autoSave: true,
      autoSaveInterval: 30000, // 30 seconds
      backupEnabled: true,
      backupCount: 5,
      theme: 'ninja-dark'
    };
    this.recentProjects = [];
    this.collaborators = new Map();
  }

  /**
   * Initialize workspace manager
   */
  async initialize(workspacePath) {
    this.workspacePath = workspacePath;
    
    // Create workspace directories
    await this.createWorkspaceStructure();
    
    // Load recent projects
    await this.loadRecentProjects();
    
    // Load project templates
    await this.loadProjectTemplates();
    
    console.log('🏢 Ninja Workspace Manager initialized');
  }

  /**
   * Create workspace directory structure
   */
  async createWorkspaceStructure() {
    const directories = [
      'projects',
      'sessions',
      'templates',
      'backups',
      'exports',
      'assets',
      'collaboration'
    ];
    
    for (const dir of directories) {
      const dirPath = path.join(this.workspacePath, dir);
      try {
        await fs.mkdir(dirPath, { recursive: true });
      } catch (error) {
        console.warn(`⚠️ Could not create directory ${dir}:`, error.message);
      }
    }
  }

  /**
   * Create a new project
   */
  async createProject(projectConfig) {
    const projectId = this.generateProjectId();
    
    const project = {
      id: projectId,
      name: projectConfig.name || 'Untitled Project',
      type: projectConfig.type || 'music-production',
      createdAt: Date.now(),
      lastModified: Date.now(),
      status: 'active',
      metadata: {
        artist: projectConfig.artist || '',
        genre: projectConfig.genre || '',
        bpm: projectConfig.bpm || null,
        key: projectConfig.key || '',
        description: projectConfig.description || ''
      },
      tracks: [],
      assets: [],
      collaborators: [],
      settings: {
        sampleRate: 48000,
        bitDepth: 24,
        exportFormat: 'wav'
      },
      sessions: [],
      analytics: {
        totalPlaytime: 0,
        editCount: 0,
        lastExport: null
      }
    };
    
    // Create project directory
    const projectDir = path.join(this.workspacePath, 'projects', projectId);
    await fs.mkdir(projectDir, { recursive: true });
    
    // Save project file
    await this.saveProject(project);
    
    // Add to recent projects
    this.addToRecentProjects(project);
    
    this.currentProject = project;
    
    console.log(`📁 Project created: ${project.name} (${projectId})`);
    
    return project;
  }

  /**
   * Load an existing project
   */
  async loadProject(projectId) {
    const projectPath = path.join(this.workspacePath, 'projects', projectId, 'project.json');
    
    try {
      const projectData = await fs.readFile(projectPath, 'utf8');
      const project = JSON.parse(projectData);
      
      this.currentProject = project;
      this.addToRecentProjects(project);
      
      console.log(`📂 Project loaded: ${project.name}`);
      
      return project;
      
    } catch (error) {
      console.error('❌ Failed to load project:', error);
      throw new Error(`Project not found: ${projectId}`);
    }
  }

  /**
   * Save current project
   */
  async saveProject(project = this.currentProject) {
    if (!project) {
      throw new Error('No project to save');
    }
    
    project.lastModified = Date.now();
    project.analytics.editCount++;
    
    const projectPath = path.join(
      this.workspacePath, 
      'projects', 
      project.id, 
      'project.json'
    );
    
    await fs.writeFile(
      projectPath, 
      JSON.stringify(project, null, 2), 
      'utf8'
    );
    
    // Create backup if enabled
    if (this.workspacePreferences.backupEnabled) {
      await this.createBackup(project);
    }
    
    console.log(`💾 Project saved: ${project.name}`);
  }

  /**
   * Create project backup
   */
  async createBackup(project) {
    const backupDir = path.join(
      this.workspacePath,
      'backups',
      project.id
    );
    
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = Date.now();
    const backupPath = path.join(
      backupDir,
      `backup_${timestamp}.json`
    );
    
    await fs.writeFile(
      backupPath,
      JSON.stringify(project, null, 2),
      'utf8'
    );
    
    // Clean old backups
    await this.cleanOldBackups(project.id);
  }

  /**
   * Clean old backups
   */
  async cleanOldBackups(projectId) {
    const backupDir = path.join(this.workspacePath, 'backups', projectId);
    
    try {
      const files = await fs.readdir(backupDir);
      const backups = files
        .filter(f => f.startsWith('backup_'))
        .map(f => ({
          name: f,
          path: path.join(backupDir, f),
          time: parseInt(f.split('_')[1].split('.')[0])
        }))
        .sort((a, b) => b.time - a.time);
      
      // Keep only the specified number of backups
      if (backups.length > this.workspacePreferences.backupCount) {
        const toDelete = backups.slice(this.workspacePreferences.backupCount);
        
        for (const backup of toDelete) {
          await fs.unlink(backup.path);
        }
      }
      
    } catch (error) {
      // Directory might not exist yet
      console.warn('⚠️ Could not clean backups:', error.message);
    }
  }

  /**
   * Create a new session
   */
  async createSession(sessionConfig) {
    if (!this.currentProject) {
      throw new Error('No active project');
    }
    
    const sessionId = this.generateSessionId();
    
    const session = {
      id: sessionId,
      projectId: this.currentProject.id,
      name: sessionConfig.name || 'Session',
      type: sessionConfig.type || 'production',
      createdAt: Date.now(),
      lastModified: Date.now(),
      participants: sessionConfig.participants || [],
      collaborators: [],
      notes: sessionConfig.notes || '',
      recordings: [],
      chat: [],
      snapshots: []
    };
    
    // Save session
    const sessionPath = path.join(
      this.workspacePath,
      'sessions',
      `${sessionId}.json`
    );
    
    await fs.writeFile(
      sessionPath,
      JSON.stringify(session, null, 2),
      'utf8'
    );
    
    // Add to project sessions
    this.currentProject.sessions.push(sessionId);
    this.activeSessions.set(sessionId, session);
    
    console.log(`🎥 Session created: ${session.name}`);
    
    return session;
  }

  /**
   * Load recent projects
   */
  async loadRecentProjects() {
    const recentPath = path.join(this.workspacePath, 'recent.json');
    
    try {
      const recentData = await fs.readFile(recentPath, 'utf8');
      this.recentProjects = JSON.parse(recentData);
    } catch (error) {
      // File doesn't exist yet
      this.recentProjects = [];
    }
  }

  /**
   * Save recent projects
   */
  async saveRecentProjects() {
    const recentPath = path.join(this.workspacePath, 'recent.json');
    
    await fs.writeFile(
      recentPath,
      JSON.stringify(this.recentProjects, null, 2),
      'utf8'
    );
  }

  /**
   * Add project to recent projects
   */
  addToRecentProjects(project) {
    // Remove if already exists
    this.recentProjects = this.recentProjects.filter(
      p => p.id !== project.id
    );
    
    // Add to front
    this.recentProjects.unshift({
      id: project.id,
      name: project.name,
      type: project.type,
      lastAccessed: Date.now(),
      thumbnail: project.thumbnail || null
    });
    
    // Keep only last 20
    if (this.recentProjects.length > 20) {
      this.recentProjects = this.recentProjects.slice(0, 20);
    }
    
    this.saveRecentProjects();
  }

  /**
   * Load project templates
   */
  async loadProjectTemplates() {
    const templatesDir = path.join(this.workspacePath, 'templates');
    
    try {
      const files = await fs.readdir(templatesDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const templatePath = path.join(templatesDir, file);
          const templateData = await fs.readFile(templatePath, 'utf8');
          const template = JSON.parse(templateData);
          
          this.projectTemplates.set(template.id, template);
        }
      }
      
    } catch (error) {
      // Templates directory might not exist yet
      console.warn('⚠️ Could not load templates:', error.message);
    }
  }

  /**
   * Create project from template
   */
  async createFromTemplate(templateId, projectName) {
    const template = this.projectTemplates.get(templateId);
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    const project = await this.createProject({
      name: projectName,
      type: template.type,
      ...template.defaults
    });
    
    // Apply template configuration
    project.settings = { ...project.settings, ...template.settings };
    project.metadata = { ...project.metadata, ...template.metadata };
    
    await this.saveProject(project);
    
    console.log(`📋 Project created from template: ${projectName}`);
    
    return project;
  }

  /**
   * Add collaborator to project
   */
  async addCollaborator(projectId, collaborator) {
    const project = await this.loadProject(projectId);
    
    const collab = {
      id: this.generateCollaboratorId(),
      name: collaborator.name,
      email: collaborator.email,
      role: collaborator.role || 'contributor',
      permissions: collaborator.permissions || ['read', 'comment'],
      joinedAt: Date.now()
    };
    
    project.collaborators.push(collab);
    await this.saveProject(project);
    
    console.log(`👥 Collaborator added: ${collab.name}`);
    
    return collab;
  }

  /**
   * Get workspace statistics
   */
  getWorkspaceStats() {
    return {
      currentProject: this.currentProject ? {
        id: this.currentProject.id,
        name: this.currentProject.name,
        status: this.currentProject.status
      } : null,
      activeSessions: this.activeSessions.size,
      recentProjects: this.recentProjects.length,
      availableTemplates: this.projectTemplates.size,
      workspacePreferences: this.workspacePreferences
    };
  }

  /**
   * Generate unique project ID
   */
  generateProjectId() {
    return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique collaborator ID
   */
  generateCollaboratorId() {
    return `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NinjaWorkspace;
}