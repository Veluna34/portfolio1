// Database using IndexedDB for local storage
const db = {
    dbName: 'PortfolioDB',
    version: 1,
    db: null,

    // Initialize database
    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create projects store if it doesn't exist
                if (!db.objectStoreNames.contains('projects')) {
                    const objectStore = db.createObjectStore('projects', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Create indexes for searching
                    objectStore.createIndex('title', 'title', { unique: false });
                    objectStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                }
            };
        });
    },

    // Get all projects
    async getProjects() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readonly');
            const objectStore = transaction.objectStore('projects');
            const request = objectStore.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    },

    // Add a project
    async addProject(project) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readwrite');
            const objectStore = transaction.objectStore('projects');
            const request = objectStore.add(project);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    },

    // Update a project
    async updateProject(project) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readwrite');
            const objectStore = transaction.objectStore('projects');
            const request = objectStore.put(project);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    },

    // Delete a project
    async deleteProject(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readwrite');
            const objectStore = transaction.objectStore('projects');
            const request = objectStore.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    },

    // Search projects by term
    async searchProjects(searchTerm) {
        const projects = await this.getProjects();
        const term = searchTerm.toLowerCase();

        return projects.filter(project => 
            project.title.toLowerCase().includes(term) ||
            project.description.toLowerCase().includes(term) ||
            project.tags.some(tag => tag.toLowerCase().includes(term))
        );
    },

    // Get projects by tag
    async getProjectsByTag(tag) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readonly');
            const objectStore = transaction.objectStore('projects');
            const index = objectStore.index('tags');
            const request = index.getAll(tag);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    },

};

// Initialize database when script loads
db.init().then(() => {
    // Uncomment the line below to seed sample data on first load
    db.seedSampleData();
});