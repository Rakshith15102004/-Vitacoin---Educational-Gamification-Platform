// Enhanced Application Data with Local Storage
class VitacoinApp {
    constructor() {
        this.initializeData();
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.lastClaimDate = null;
        this.websocket = null; // For future real-time updates
        this.autoSaveInterval = null;
        this.penaltyCheckInterval = null;
    }

    initializeData() {
        // Load data from localStorage or use defaults
        this.appData = {
            users: this.loadFromStorage('users') || [
                {"id": 1, "name": "Alex Chen", "email": "alex@student.edu", "role": "student", "vitacoins": 2450, "badges": ["Gold Badge", "Quiz Master", "Streak Champion"], "streak": 15, "rank": 1, "password": "password123", "lastLogin": new Date().toISOString(), "lastActivity": new Date().toISOString()},
                {"id": 2, "name": "Sarah Johnson", "email": "sarah@student.edu", "role": "student", "vitacoins": 2100, "badges": ["Silver Badge", "Assignment Pro"], "streak": 8, "rank": 2, "password": "password123", "lastLogin": new Date().toISOString(), "lastActivity": new Date().toISOString()},
                {"id": 3, "name": "Michael Torres", "email": "michael@student.edu", "role": "student", "vitacoins": 1875, "badges": ["Bronze Badge", "Forum Star"], "streak": 3, "rank": 3, "password": "password123", "lastLogin": new Date().toISOString(), "lastActivity": new Date().toISOString()},
                {"id": 4, "name": "Prof. Wilson", "email": "wilson@admin.edu", "role": "admin", "vitacoins": 0, "badges": [], "streak": 0, "rank": 0, "password": "admin123", "lastLogin": new Date().toISOString(), "lastActivity": new Date().toISOString()}
            ],
            transactions: this.loadFromStorage('transactions') || [
    {"id": 1, "userId": 1, "type": "reward", "amount": 50, "description": "Quiz completion bonus", "date": "2025-08-24T10:00:00Z"},
    {"id": 2, "userId": 1, "type": "reward", "amount": 25, "description": "Daily login bonus", "date": "2025-08-24T09:00:00Z"},
    {"id": 3, "userId": 2, "type": "penalty", "amount": -10, "description": "Missed assignment deadline", "date": "2025-08-23T15:00:00Z"},
    {"id": 4, "userId": 1, "type": "reward", "amount": 100, "description": "Perfect quiz score", "date": "2025-08-23T14:00:00Z"},
    {"id": 5, "userId": 3, "type": "reward", "amount": 75, "description": "Forum participation bonus", "date": "2025-08-23T12:00:00Z"},
    {"id": 6, "userId": 2, "type": "reward", "amount": 25, "description": "Daily login bonus", "date": "2025-08-23T08:00:00Z"}
  ],
            tasks: this.loadFromStorage('tasks') || [
                {"id": 1, "title": "JavaScript Fundamentals Quiz", "description": "Complete the basic JavaScript quiz", "reward": 50, "deadline": "2025-08-30", "status": "available", "type": "quiz", "submissions": []},
                {"id": 2, "title": "React Components Assignment", "description": "Build a component library", "reward": 100, "deadline": "2025-09-05", "status": "available", "type": "assignment", "submissions": []},
                {"id": 3, "title": "Database Design Project", "description": "Design and implement a database schema", "reward": 150, "deadline": "2025-09-10", "status": "available", "type": "project", "submissions": []}
            ],
            notifications: this.loadFromStorage('notifications') || [],
            systemSettings: this.loadFromStorage('systemSettings') || {
                deadlinePenalty: 10,
                inactivityPenalty: 1,
                maxInactivityDays: 3,
                dailyBonus: 25
            }
        };
        
        this.saveToStorage('users', this.appData.users);
        this.saveToStorage('transactions', this.appData.transactions);
        this.saveToStorage('tasks', this.appData.tasks);
        this.saveToStorage('systemSettings', this.appData.systemSettings);
    }

    // Local Storage Methods
    saveToStorage(key, data) {
        try {
            localStorage.setItem(`vitacoin_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(`vitacoin_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    // Enhanced User Management
    createUser(userData) {
        const newUser = {
            id: this.appData.users.length + 1,
            ...userData,
            vitacoins: userData.role === 'student' ? 100 : 0,
            badges: userData.role === 'student' ? ['Welcome Badge'] : [],
            streak: 1,
            rank: this.appData.users.filter(u => u.role === 'student').length + 1,
            lastLogin: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        this.appData.users.push(newUser);
        this.saveToStorage('users', this.appData.users);

        if (userData.role === 'student') {
            this.addTransaction(newUser.id, 'reward', 100, 'Welcome bonus');
            this.updateUserRankings();
        }

        return newUser;
    }

    updateUser(userId, updates) {
        const userIndex = this.appData.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.appData.users[userIndex] = { ...this.appData.users[userIndex], ...updates };
            this.saveToStorage('users', this.appData.users);
            return this.appData.users[userIndex];
        }
        return null;
    }

    getUserById(userId) {
        return this.appData.users.find(u => u.id === userId);
    }

    getUserByEmail(email) {
        return this.appData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    authenticateUser(email, password, role) {
        const user = this.appData.users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password && 
            u.role === role
        );
        return user || null;
    }

    validateUserCredentials(email, password, role) {
        if (!email || !password || !role) {
            return { valid: false, error: 'All fields are required' };
        }
        
        if (!email.includes('@') || !email.includes('.')) {
            return { valid: false, error: 'Please enter a valid email address' };
        }
        
        if (password.length < 6) {
            return { valid: false, error: 'Password must be at least 6 characters long' };
        }
        
        if (role !== 'student' && role !== 'admin') {
            return { valid: false, error: 'Please select a valid role' };
        }
        
        return { valid: true, error: null };
    }

    // Session Management
    isUserLoggedIn() {
        try {
            const savedUser = localStorage.getItem('vitacoin_currentUser') || sessionStorage.getItem('vitacoin_currentUser');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                // Verify user still exists in system
                return this.getUserById(user.id) !== undefined;
            }
            return false;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }

    getCurrentUser() {
        try {
            const savedUser = localStorage.getItem('vitacoin_currentUser') || sessionStorage.getItem('vitacoin_currentUser');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                // Return fresh data from system
                return this.getUserById(user.id);
            }
            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Security Features
    validateSession() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return false;
        }
        
        // Check if user has been inactive for too long (optional security feature)
        const lastActivity = new Date(currentUser.lastActivity);
        const now = new Date();
        const hoursInactive = (now - lastActivity) / (1000 * 60 * 60);
        
        // Auto-logout after 24 hours of inactivity
        if (hoursInactive > 24) {
            this.logoutUser(currentUser.id);
            return false;
        }
        
        return true;
    }

    logoutUser(userId) {
        try {
            // Update user's last activity
            this.updateUser(userId, {
                lastActivity: new Date().toISOString()
            });
            
            // Clear storage
            localStorage.removeItem('vitacoin_currentUser');
            localStorage.removeItem('vitacoin_lastClaimDate');
            localStorage.removeItem('vitacoin_lastLogin');
            sessionStorage.removeItem('vitacoin_currentUser');
            sessionStorage.removeItem('vitacoin_lastClaimDate');
            
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    // Enhanced Transaction System
    addTransaction(userId, type, amount, description) {
        const transaction = {
            id: this.appData.transactions.length + 1,
            userId,
            type,
            amount,
            description,
            date: new Date().toISOString()
        };

        this.appData.transactions.push(transaction);
        this.saveToStorage('transactions', this.appData.transactions);

        // Update user balance
        const user = this.appData.users.find(u => u.id === userId);
        if (user) {
            user.vitacoins += amount;
            user.lastActivity = new Date().toISOString();
            this.saveToStorage('users', this.appData.users);
        }

        // Add notification
        this.addNotification(userId, type, description, amount);

        return transaction;
    }

    // Enhanced Task Management
    createTask(taskData) {
        const newTask = {
            id: this.appData.tasks.length + 1,
            ...taskData,
            status: 'available',
            submissions: [],
            createdAt: new Date().toISOString()
        };

        this.appData.tasks.push(newTask);
        this.saveToStorage('tasks', this.appData.tasks);
        return newTask;
    }

    submitTask(userId, taskId, submission) {
        const task = this.appData.tasks.find(t => t.id === taskId);
        const user = this.appData.users.find(u => u.id === userId);

        if (!task || !user) return false;

        const submissionData = {
            id: task.submissions.length + 1,
            userId,
            submission,
            submittedAt: new Date().toISOString(),
            status: 'pending'
        };

        task.submissions.push(submissionData);
        this.saveToStorage('tasks', this.appData.tasks);

        // Check if submission is on time
        const deadline = new Date(task.deadline);
        const now = new Date();
        
        if (now <= deadline) {
            // On time - award coins
            this.addTransaction(userId, 'reward', task.reward, `Completed: ${task.title}`);
            submissionData.status = 'approved';
            this.addBadge(userId, 'Task Master');
        } else {
            // Late submission - apply penalty
            const penalty = this.appData.systemSettings.deadlinePenalty;
            this.addTransaction(userId, 'penalty', -penalty, `Late submission: ${task.title}`);
            submissionData.status = 'late';
        }

        return submissionData;
    }

    // Enhanced Badge System
    addBadge(userId, badgeName) {
        const user = this.appData.users.find(u => u.id === userId);
        if (user && !user.badges.includes(badgeName)) {
            user.badges.push(badgeName);
            this.saveToStorage('users', this.appData.users);
            this.addNotification(userId, 'info', `New badge earned: ${badgeName}!`, 0);
        }
    }

    // Enhanced Penalty System
    checkAndApplyPenalties() {
        const now = new Date();
        const students = this.appData.users.filter(u => u.role === 'student');

        students.forEach(student => {
            const lastActivity = new Date(student.lastActivity);
            const daysInactive = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

            if (daysInactive > 1 && daysInactive <= this.appData.systemSettings.maxInactivityDays) {
                const penalty = this.appData.systemSettings.inactivityPenalty;
                this.addTransaction(student.id, 'penalty', -penalty, `Inactivity penalty (${daysInactive} days)`);
            }
        });
    }

    // Enhanced Notification System
    addNotification(userId, type, message, amount = 0) {
        const notification = {
            id: this.appData.notifications.length + 1,
            userId,
            type,
            message,
            amount,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.appData.notifications.push(notification);
        this.saveToStorage('notifications', this.appData.notifications);

        // Show real-time notification
        this.showRealTimeNotification(notification);
    }

    // Enhanced Daily Bonus System
    claimDailyBonus(userId) {
        const user = this.appData.users.find(u => u.id === userId);
        if (!user) return false;

        const today = new Date().toDateString();
        const lastClaim = this.lastClaimDate ? new Date(this.lastClaimDate).toDateString() : null;

        if (lastClaim === today) return false;

        const bonus = this.appData.systemSettings.dailyBonus;
        this.addTransaction(userId, 'reward', bonus, 'Daily login bonus');
        
        // Update streak
        this.updateStreak(userId);
        
        this.lastClaimDate = new Date().toISOString();
        this.saveToStorage('lastClaimDate', this.lastClaimDate);

        return true;
    }

    // Enhanced Streak System
    updateStreak(userId) {
        const user = this.appData.users.find(u => u.id === userId);
        if (!user) return;

        const today = new Date().toDateString();
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toDateString() : null;

        if (lastLogin === today) return;

        if (lastLogin) {
            const lastLoginDate = new Date(user.lastLogin);
            const todayDate = new Date();
            const daysDiff = Math.floor((todayDate - lastLoginDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === 1) {
                user.streak += 1;
                if (user.streak === 7) {
                    this.addBadge(userId, 'Streak Champion');
                }
            } else if (daysDiff > 1) {
                user.streak = 1;
            }
        } else {
            user.streak = 1;
        }

        user.lastLogin = new Date().toISOString();
        this.updateUser(userId, { streak: user.streak, lastLogin: user.lastLogin });
    }

    // Enhanced Ranking System
    updateUserRankings() {
        const students = this.appData.users.filter(u => u.role === 'student');
        students.sort((a, b) => b.vitacoins - a.vitacoins);
        
        students.forEach((student, index) => {
            student.rank = index + 1;
            this.updateUser(student.id, { rank: student.rank });
        });
    }



    showRealTimeNotification(notification) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${notification.type}`;
        
        let icon = 'fas fa-info-circle';
        if (notification.type === 'success' || notification.type === 'reward') icon = 'fas fa-check-circle';
        else if (notification.type === 'error' || notification.type === 'penalty') icon = 'fas fa-exclamation-circle';
        
        notificationElement.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon ${notification.type}">
                    <i class="${icon}"></i>
                </div>
                <div class="notification-message">${notification.message}</div>
                ${notification.amount !== 0 ? `<div class="notification-amount ${notification.amount > 0 ? 'positive' : 'negative'}">${notification.amount > 0 ? '+' : ''}${notification.amount}</div>` : ''}
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(notificationElement);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.remove();
            }
        }, 5000);
        
        // Close button handler
        const closeButton = notificationElement.querySelector('.notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                notificationElement.remove();
            });
        }
    }

    // Enhanced Search and Filter
    searchUsers(query) {
        return this.appData.users.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
    }

    filterTransactions(filters) {
        let filtered = [...this.appData.transactions];
        
        if (filters.userId) {
            filtered = filtered.filter(t => t.userId === filters.userId);
        }
        
        if (filters.type && filters.type !== 'all') {
            filtered = filtered.filter(t => t.type === filters.type);
        }
        
        if (filters.dateFrom) {
            filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
        }
        
        if (filters.dateTo) {
            filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.dateTo));
        }
        
        return filtered;
    }

    // Enhanced Analytics
    getAnalytics() {
        const students = this.appData.users.filter(u => u.role === 'student');
        const totalVitacoins = students.reduce((sum, s) => sum + s.vitacoins, 0);
        const avgVitacoins = students.length > 0 ? totalVitacoins / students.length : 0;
        const activeToday = students.filter(s => {
            const lastActivity = new Date(s.lastActivity);
            const today = new Date();
            return lastActivity.toDateString() === today.toDateString();
        }).length;

        return {
            totalStudents: students.length,
            totalVitacoins,
            avgVitacoins: Math.round(avgVitacoins),
            activeToday,
            totalTasks: this.appData.tasks.length,
            completedTasks: this.appData.transactions.filter(t => t.type === 'reward' && t.description.includes('Completed')).length
        };
    }

    // Auto-save and Maintenance
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveAllData();
        }, 30000); // Save every 30 seconds
    }

    startPenaltyCheck() {
        this.penaltyCheckInterval = setInterval(() => {
            this.checkAndApplyPenalties();
        }, 3600000); // Check every hour
    }

    saveAllData() {
        this.saveToStorage('users', this.appData.users);
        this.saveToStorage('transactions', this.appData.transactions);
        this.saveToStorage('tasks', this.appData.tasks);
        this.saveToStorage('notifications', this.appData.notifications);
        this.saveToStorage('systemSettings', this.appData.systemSettings);
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        if (this.penaltyCheckInterval) {
            clearInterval(this.penaltyCheckInterval);
        }
    }
}

// Initialize the enhanced application
const vitacoinApp = new VitacoinApp();

// Application State
let currentUser = null;
let currentPage = 'dashboard';
let lastClaimDate = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing enhanced Vitacoin app...');
    
    // Initialize the application
    vitacoinApp.startAutoSave();
    vitacoinApp.startPenaltyCheck();
    startAutoSave();
    startPenaltyCheck();
    
    // Check for saved login state
    checkSavedLogin();
    
    // Initialize authentication
    initializeAuth();
    setupEventListeners();
    
    // Set up session validation
    setInterval(() => {
        if (currentUser && !vitacoinApp.validateSession()) {
            console.log('Session expired, logging out user');
            logout();
        }
    }, 60000); // Check every minute
    
    // Set up user activity tracking
    document.addEventListener('click', updateUserActivity);
    document.addEventListener('keypress', updateUserActivity);
    document.addEventListener('scroll', updateUserActivity);
    
    console.log('Vitacoin application initialized successfully');
});

function initializeAuth() {
    console.log('Initializing authentication system...');
    
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    console.log('Auth elements found:', {
        loginTab: !!loginTab,
        signupTab: !!signupTab,
        loginForm: !!loginForm,
        signupForm: !!signupForm
    });
    
    if (loginTab && signupTab && loginForm && signupForm) {
        // Set up tab switching
        loginTab.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Login tab clicked');
            switchAuthTab('login');
        });
        
        signupTab.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Signup tab clicked');
            switchAuthTab('signup');
        });
        
        // Set up form submissions
        loginForm.addEventListener('submit', (e) => {
            console.log('Login form submitted');
            handleLogin(e);
        });
        
        signupForm.addEventListener('submit', (e) => {
            console.log('Signup form submitted');
            handleSignup(e);
        });
        
        console.log('Authentication system initialized successfully');
        
    } else {
        console.error('Authentication elements not found. Please check the HTML structure.');
        vitacoinApp.showNotification('error', 'Authentication system failed to initialize. Please refresh the page.');
    }
}

function switchAuthTab(tab) {
    console.log('Switching to tab:', tab);
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    } else {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    }
}

// Enhanced Authentication System
function handleLogin(e) {
    e.preventDefault();
    console.log('Handling login...');
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;
    
    console.log('Login attempt:', { email, role, password: password ? '***' : 'empty' });
    
    // Use the enhanced validation from VitacoinApp class
    const validation = vitacoinApp.validateUserCredentials(email, password, role);
    if (!validation.valid) {
        vitacoinApp.showNotification('error', validation.error);
        return;
    }
    
    try {
        // Use the enhanced authentication method
        const user = vitacoinApp.authenticateUser(email, password, role);
        
        if (user) {
            console.log('Login successful for user:', user.name);
            
            // Update user's last login and activity
            vitacoinApp.updateUser(user.id, {
                lastLogin: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            });
            
            // Set current user
            currentUser = {...user};
            
            // Save login state to localStorage
            saveLoginState();
            
            // Show the main application
            showApp();
            
            // Show success notification
            vitacoinApp.showNotification('success', `Welcome back, ${user.name}!`);
            
            // Update streak for students
            if (user.role === 'student') {
                vitacoinApp.updateStreak(user.id);
            }
            
        } else {
            console.log('Login failed - invalid credentials');
            vitacoinApp.showNotification('error', 'Invalid credentials. Please check your email, password, and role.');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        vitacoinApp.showNotification('error', 'An error occurred during login. Please try again.');
    }
}

function handleSignup(e) {
    e.preventDefault();
    console.log('Handling signup...');
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    
    console.log('Signup attempt:', { name, email, role, password: password ? '***' : 'empty' });
    
    // Enhanced validation
    if (!name || name.length < 2) {
        vitacoinApp.showNotification('error', 'Name must be at least 2 characters long.');
        return;
    }
    
    // Use the enhanced validation from VitacoinApp class
    const validation = vitacoinApp.validateUserCredentials(email, password, role);
    if (!validation.valid) {
        vitacoinApp.showNotification('error', validation.error);
        return;
    }
    
    try {
        // Check if email already exists
        const existingUser = vitacoinApp.getUserByEmail(email);
        
        if (existingUser) {
            vitacoinApp.showNotification('error', 'Email already registered. Please use a different email or login instead.');
            return;
        }
        
        // Create new user using the enhanced class method
        const newUser = vitacoinApp.createUser({
            name,
            email,
            password,
            role
        });
        
        console.log('New user created:', newUser);
        
        // Set current user
        currentUser = {...newUser};
        
        // Save login state
        saveLoginState();
        
        // Show the main application
        showApp();
        
        // Handle role-specific onboarding
        if (role === 'student') {
            // Show welcome bonus notification and animation
            vitacoinApp.showNotification('success', `Welcome ${name}! You received 100 Vitacoins as a welcome bonus!`);
            animateCoins(5); // Show coin animation
            
            // Add welcome badge
            vitacoinApp.addBadge(newUser.id, 'Welcome Badge');
            
        } else {
            // Admin account created
            vitacoinApp.showNotification('success', `Welcome ${name}! Your administrator account has been created successfully.`);
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        vitacoinApp.showNotification('error', 'An error occurred during signup. Please try again.');
    }
}

// Enhanced Login State Management
function saveLoginState() {
    try {
        if (currentUser) {
            localStorage.setItem('vitacoin_currentUser', JSON.stringify(currentUser));
            localStorage.setItem('vitacoin_lastClaimDate', JSON.stringify(lastClaimDate));
            localStorage.setItem('vitacoin_lastLogin', new Date().toISOString());
            console.log('Login state saved to localStorage successfully');
        }
    } catch (error) {
        console.error('Error saving login state:', error);
        // Fallback to session storage if localStorage fails
        try {
            sessionStorage.setItem('vitacoin_currentUser', JSON.stringify(currentUser));
            sessionStorage.setItem('vitacoin_lastClaimDate', JSON.stringify(lastClaimDate));
            console.log('Login state saved to sessionStorage as fallback');
        } catch (fallbackError) {
            console.error('Failed to save login state to both localStorage and sessionStorage:', fallbackError);
        }
    }
}

function checkSavedLogin() {
    try {
        // Try localStorage first
        let savedUser = localStorage.getItem('vitacoin_currentUser');
        let savedLastClaim = localStorage.getItem('vitacoin_lastClaimDate');
        
        // Fallback to sessionStorage if localStorage is empty
        if (!savedUser) {
            savedUser = sessionStorage.getItem('vitacoin_currentUser');
            savedLastClaim = sessionStorage.getItem('vitacoin_lastClaimDate');
        }
        
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                const lastClaim = savedLastClaim ? JSON.parse(savedLastClaim) : null;
                
                console.log('Found saved user, attempting auto-login:', user.name);
                
                // Verify user still exists in the system
                const userExists = vitacoinApp.appData.users.find(u => u.id === user.id);
                
                if (userExists) {
                    currentUser = {...userExists}; // Use fresh data from system
                    lastClaimDate = lastClaim;
                    
                    // Update last activity
                    vitacoinApp.updateUser(user.id, {
                        lastActivity: new Date().toISOString()
                    });
                    
                    console.log('Auto-login successful for user:', currentUser.name);
                    showApp();
                    
                    // Show welcome back message
                    vitacoinApp.showNotification('info', `Welcome back, ${currentUser.name}!`);
                    
                } else {
                    console.log('Saved user no longer exists in system, clearing saved data');
                    clearSavedLoginState();
                }
                
            } catch (parseError) {
                console.error('Error parsing saved user data:', parseError);
                clearSavedLoginState();
            }
        }
        
    } catch (error) {
        console.error('Error checking saved login state:', error);
        clearSavedLoginState();
    }
}

function clearSavedLoginState() {
    try {
        localStorage.removeItem('vitacoin_currentUser');
        localStorage.removeItem('vitacoin_lastClaimDate');
        localStorage.removeItem('vitacoin_lastLogin');
        sessionStorage.removeItem('vitacoin_currentUser');
        sessionStorage.removeItem('vitacoin_lastClaimDate');
        console.log('Saved login state cleared');
    } catch (error) {
        console.error('Error clearing saved login state:', error);
    }
}

function showApp() {
    console.log('Showing main application for user:', currentUser?.name);
    
    const authSection = document.getElementById('auth-section');
    const appSection = document.getElementById('app-section');
    
    console.log('App sections found:', {
        authSection: !!authSection,
        appSection: !!appSection
    });
    
    if (authSection && appSection) {
        // Hide authentication section
        authSection.classList.add('hidden');
        console.log('Authentication section hidden');
        
        // Show main application section
        appSection.classList.remove('hidden');
        console.log('Main application section shown');
        
        // Set up user interface
        setupUserInfo();
        setupNavigation();
        showDashboard();
        
        // Update streak and check for daily claim
        if (currentUser && currentUser.role === 'student') {
            updateStreak();
            updateClaimButton();
        }
        
        console.log('Application interface setup completed');
        
    } else {
        console.error('Application sections not found. Cannot display main interface.');
        vitacoinApp.showNotification('error', 'Failed to load application interface. Please refresh the page.');
    }
}

function setupUserInfo() {
    const nameElement = document.getElementById('current-user-name');
    const roleElement = document.getElementById('current-user-role');
    
    if (nameElement && roleElement && currentUser) {
        nameElement.textContent = currentUser.name;
        roleElement.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    }
}

function setupNavigation() {
    const sidebarMenu = document.getElementById('sidebar-menu');
    if (!sidebarMenu || !currentUser) return;
    
    sidebarMenu.innerHTML = '';
    
    if (currentUser.role === 'student') {
        const studentMenuItems = [
            { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt' },
            { id: 'transaction-history', name: 'Transaction History', icon: 'fas fa-history' },
            { id: 'tasks', name: 'My Tasks', icon: 'fas fa-tasks' },
            { id: 'leaderboard', name: 'Leaderboard', icon: 'fas fa-trophy' }
        ];
        
        studentMenuItems.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="#" data-page="${item.id}" class="${item.id === 'dashboard' ? 'active' : ''}">
                    <i class="${item.icon}"></i>
                    ${item.name}
                </a>
            `;
            sidebarMenu.appendChild(li);
        });
    } else {
        const adminMenuItems = [
            { id: 'admin-dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt' },
            { id: 'user-management', name: 'User Management', icon: 'fas fa-users' },
            { id: 'task-management', name: 'Task Management', icon: 'fas fa-clipboard-list' },
            { id: 'analytics', name: 'Analytics', icon: 'fas fa-chart-bar' }
        ];
        
        adminMenuItems.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="#" data-page="${item.id}" class="${item.id === 'admin-dashboard' ? 'active' : ''}">
                    <i class="${item.icon}"></i>
                    ${item.name}
                </a>
            `;
            sidebarMenu.appendChild(li);
        });
    }
    
    // Add event listeners to navigation links
    sidebarMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            console.log('Navigating to page:', page);
            navigateToPage(page);
        });
    });
}

function navigateToPage(page) {
    console.log('Navigating to page:', page);
    
    // Update active navigation
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Hide all content sections
    document.querySelectorAll('.dashboard-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show appropriate content based on page
    currentPage = page;
    
    switch(page) {
        case 'dashboard':
            document.getElementById('student-dashboard')?.classList.remove('hidden');
            setupStudentDashboard();
            break;
        case 'admin-dashboard':
            document.getElementById('admin-dashboard')?.classList.remove('hidden');
            setupAdminDashboard();
            break;
        case 'transaction-history':
            document.getElementById('transaction-history')?.classList.remove('hidden');
            showTransactionHistory();
            break;
        case 'tasks':
            // For now, show available tasks in dashboard format
            document.getElementById('student-dashboard')?.classList.remove('hidden');
            setupTasksPage();
            break;
        case 'leaderboard':
            // For now, show leaderboard in dashboard format  
            document.getElementById('student-dashboard')?.classList.remove('hidden');
            setupLeaderboardPage();
            break;
        case 'user-management':
        case 'task-management':
        case 'analytics':
            document.getElementById('admin-dashboard')?.classList.remove('hidden');
            setupAdminDashboard();
            break;
        default:
            console.warn('Unknown page:', page);
    }
}

function showDashboard() {
    if (!currentUser) return;
    
    if (currentUser.role === 'student') {
        const studentDashboard = document.getElementById('student-dashboard');
        if (studentDashboard) {
            studentDashboard.classList.remove('hidden');
            setupStudentDashboard();
        }
    } else {
        const adminDashboard = document.getElementById('admin-dashboard');
        if (adminDashboard) {
            adminDashboard.classList.remove('hidden');
            setupAdminDashboard();
        }
    }
}

function setupStudentDashboard() {
    const studentNameElement = document.getElementById('student-name');
    if (studentNameElement) {
        studentNameElement.textContent = currentUser.name;
    }
    
    updateVitacoinBalance();
    updateUserStats();
    updateStreakDisplay();
    updateBadges();
    updateLeaderboard();
    updateAvailableTasks();
}

function setupTasksPage() {
    // Similar to student dashboard but focused on tasks
    setupStudentDashboard();
}

function setupLeaderboardPage() {
    // Similar to student dashboard but focused on leaderboard
    setupStudentDashboard();
}

function updateVitacoinBalance() {
    const balanceElement = document.getElementById('vitacoin-balance');
    if (balanceElement && currentUser) {
        // Get the most up-to-date balance from the user data
        const userInData = vitacoinApp.appData.users.find(u => u.id === currentUser.id);
        if (userInData) {
            currentUser.vitacoins = userInData.vitacoins;
        }
        animateNumber(balanceElement, parseInt(balanceElement.textContent.replace(/,/g, '') || 0), currentUser.vitacoins, 1000);
    }
}

function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

function updateUserStats() {
    if (!currentUser) return;
    
    const userTransactions = vitacoinApp.appData.transactions.filter(t => t.userId === currentUser.id);
    const completedTasks = userTransactions.filter(t => t.description.includes('Quiz') || t.description.includes('Assignment')).length;
    const totalEarned = userTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    
    const completedTasksElement = document.getElementById('completed-tasks');
    const totalEarnedElement = document.getElementById('total-earned');
    const currentRankElement = document.getElementById('current-rank');
    
    if (completedTasksElement) completedTasksElement.textContent = completedTasks;
    if (totalEarnedElement) totalEarnedElement.textContent = totalEarned.toLocaleString();
    if (currentRankElement) currentRankElement.textContent = `#${currentUser.rank}`;
}

function updateStreakDisplay() {
    if (!currentUser) return;
    
    const streakElement = document.getElementById('streak-count');
    const streakIcon = document.getElementById('streak-icon');
    
    if (streakElement) {
        streakElement.textContent = currentUser.streak;
    }
    
    if (streakIcon) {
        if (currentUser.streak >= 7) {
            streakIcon.classList.add('glitter');
            streakIcon.innerHTML = '<i class="fas fa-fire"></i>';
        } else {
            streakIcon.classList.remove('glitter');
            streakIcon.classList.add('fire');
            streakIcon.innerHTML = '<i class="fas fa-fire"></i>';
        }
    }
}

function updateBadges() {
    const badgesContainer = document.getElementById('user-badges');
    if (!badgesContainer || !currentUser) return;
    
    badgesContainer.innerHTML = '';
    
    currentUser.badges.forEach(badge => {
        const badgeElement = document.createElement('div');
        badgeElement.className = 'badge-item';
        
        let badgeIcon = 'fas fa-medal';
        let badgeClass = 'bronze';
        
        if (badge.includes('Gold')) {
            badgeClass = 'gold';
        } else if (badge.includes('Silver')) {
            badgeClass = 'silver';
        } else if (badge.includes('Quiz')) {
            badgeIcon = 'fas fa-brain';
        } else if (badge.includes('Streak')) {
            badgeIcon = 'fas fa-fire';
        } else if (badge.includes('Welcome')) {
            badgeIcon = 'fas fa-star';
            badgeClass = 'gold';
        }
        
        badgeElement.innerHTML = `
            <div class="badge-icon ${badgeClass}">
                <i class="${badgeIcon}"></i>
            </div>
            <span class="badge-name">${badge}</span>
        `;
        
        badgesContainer.appendChild(badgeElement);
    });
}

function updateLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-list');
    if (!leaderboardContainer) return;
    
    leaderboardContainer.innerHTML = '';
    
    const students = vitacoinApp.appData.users
        .filter(user => user.role === 'student')
        .sort((a, b) => b.vitacoins - a.vitacoins)
        .slice(0, 5);
    
    students.forEach((student, index) => {
        const rank = index + 1;
        const leaderboardItem = document.createElement('div');
        leaderboardItem.className = 'leaderboard-item';
        
        let rankClass = 'rank-other';
        if (rank === 1) rankClass = 'rank-1';
        else if (rank === 2) rankClass = 'rank-2';
        else if (rank === 3) rankClass = 'rank-3';
        
        leaderboardItem.innerHTML = `
            <div class="leaderboard-rank ${rankClass}">${rank}</div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${student.name}</div>
                <div class="leaderboard-coins">${student.vitacoins.toLocaleString()} Vitacoins</div>
            </div>
        `;
        
        leaderboardContainer.appendChild(leaderboardItem);
    });
}

function updateAvailableTasks() {
    const tasksContainer = document.getElementById('available-tasks');
    if (!tasksContainer) return;
    
    tasksContainer.innerHTML = '';
    
    vitacoinApp.appData.tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        
        const deadline = new Date(task.deadline);
        const formattedDeadline = deadline.toLocaleDateString();
        
        taskElement.innerHTML = `
            <div class="task-header">
                <h4 class="task-title">${task.title}</h4>
                <span class="task-reward">+${task.reward}</span>
            </div>
            <div class="task-deadline">Due: ${formattedDeadline}</div>
        `;
        
        tasksContainer.appendChild(taskElement);
    });
}

function updateClaimButton() {
    const claimButton = document.getElementById('claim-daily-btn');
    const lastClaimInfo = document.getElementById('last-claim-info');
    
    if (!claimButton || !lastClaimInfo) return;
    
    const today = new Date().toDateString();
    const canClaim = !lastClaimDate || new Date(lastClaimDate).toDateString() !== today;
    
    if (canClaim) {
        claimButton.disabled = false;
        claimButton.innerHTML = '<i class="fas fa-hand-holding-heart"></i> Claim 25 Coins';
        lastClaimInfo.textContent = lastClaimDate ? `Last claimed: ${new Date(lastClaimDate).toLocaleDateString()}` : 'Last claimed: Never';
    } else {
        claimButton.disabled = true;
        claimButton.innerHTML = '<i class="fas fa-check"></i> Already Claimed Today';
        lastClaimInfo.textContent = 'Come back tomorrow for your next bonus!';
    }
}

function updateStreak() {
    if (!currentUser) return;
    
    const today = new Date();
    
    if (!lastClaimDate) {
        currentUser.streak = Math.max(1, currentUser.streak);
    } else {
        const lastClaim = new Date(lastClaimDate);
        const daysDiff = Math.floor((today - lastClaim) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            // Consecutive day
            currentUser.streak += 1;
        } else if (daysDiff > 1) {
            // Streak broken
            currentUser.streak = 1;
        }
        // Same day = no change to streak
    }
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Daily claim button
    const claimButton = document.getElementById('claim-daily-btn');
    if (claimButton) {
        claimButton.addEventListener('click', claimDailyBonus);
    }
    
    // Logout button
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    
    // Modal handlers
    setupModalHandlers();
    
    // Transaction filters
    const transactionFilter = document.getElementById('transaction-filter');
    const transactionSort = document.getElementById('transaction-sort');
    
    if (transactionFilter) {
        transactionFilter.addEventListener('change', filterTransactions);
    }
    if (transactionSort) {
        transactionSort.addEventListener('change', sortTransactions);
    }
}

function claimDailyBonus() {
    console.log('Claiming daily bonus...');
    const button = document.getElementById('claim-daily-btn');
    const today = new Date().toDateString();
    
    if (lastClaimDate && new Date(lastClaimDate).toDateString() === today) {
        vitacoinApp.showNotification('error', 'You have already claimed your daily bonus today!');
        return;
    }
    
    // Add glowing effect
    if (button) {
        button.classList.add('glowing');
    }
    
    // Update user coins - FIXED: Properly add coins instead of subtracting
    if (currentUser) {
        const oldBalance = currentUser.vitacoins;
        currentUser.vitacoins += 25;
        
        // Also update in the main data array
        const userInData = vitacoinApp.appData.users.find(u => u.id === currentUser.id);
        if (userInData) {
            userInData.vitacoins = currentUser.vitacoins;
        }
        
        lastClaimDate = new Date().toISOString();
        
        console.log(`Balance updated: ${oldBalance} -> ${currentUser.vitacoins}`);
        
        // Add transaction
        vitacoinApp.addTransaction(currentUser.id, 'reward', 25, 'Daily login bonus');
        
        // Update UI
        updateVitacoinBalance();
        updateClaimButton();
        updateUserStats();
        updateLeaderboard(); // Update leaderboard to reflect new balance
        
        // Show notification and coin animation
        vitacoinApp.showNotification('success', 'You claimed 25 Vitacoins! Daily streak continued!');
        animateCoins(3);
        
        // Remove glowing effect after animation
        setTimeout(() => {
            if (button) {
                button.classList.remove('glowing');
            }
        }, 800);
        
        saveLoginState();
    }
}

function animateCoins(count) {
    const container = document.getElementById('coin-animation-container');
    if (!container) return;
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'animated-coin';
            coin.innerHTML = '<i class="fas fa-coins"></i>';
            
            // Random position
            coin.style.left = Math.random() * window.innerWidth + 'px';
            coin.style.top = Math.random() * (window.innerHeight / 2) + 'px';
            
            container.appendChild(coin);
            
            // Remove coin after animation
            setTimeout(() => {
                coin.remove();
            }, 2000);
        }, i * 200);
    }
}




function showTransactionHistory() {
    if (!currentUser) return;
    
    const userTransactions = vitacoinApp.appData.transactions
        .filter(t => t.userId === currentUser.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    renderTransactions(userTransactions);
}

function renderTransactions(transactions) {
    const tableBody = document.getElementById('transaction-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        const date = new Date(transaction.date);
        const isPositive = transaction.amount > 0;
        
        row.innerHTML = `
            <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
            <td>${transaction.description}</td>
            <td>
                <span class="transaction-type ${transaction.type}">
                    ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
            </td>
            <td>
                <span class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                    ${isPositive ? '+' : ''}${transaction.amount.toLocaleString()}
                </span>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function filterTransactions() {
    const filter = document.getElementById('transaction-filter');
    const sort = document.getElementById('transaction-sort');
    
    if (!filter || !sort || !currentUser) return;
    
    let filtered = vitacoinApp.appData.transactions.filter(t => t.userId === currentUser.id);
    
    if (filter.value !== 'all') {
        filtered = filtered.filter(t => t.type === filter.value);
    }
    
    applySort(filtered, sort.value);
    renderTransactions(filtered);
}

function sortTransactions() {
    filterTransactions(); // This will apply both filter and sort
}

function applySort(transactions, sortBy) {
    switch(sortBy) {
        case 'date-desc':
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'amount-desc':
            transactions.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
            break;
        case 'amount-asc':
            transactions.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
            break;
    }
}

function setupAdminDashboard() {
    console.log('Setting up admin dashboard...');
    updateAdminStats();
    updateAdminTasks();
    updateRecentActivity();
    
    // Ensure modal handlers are set up for admin
    setTimeout(() => {
        setupModalHandlers();
    }, 100);
}

function updateAdminStats() {
    const analytics = vitacoinApp.getAnalytics();
    
    const totalStudentsElement = document.getElementById('total-students');
    const activeTodayElement = document.getElementById('active-today');
    const totalVitacoinsElement = document.getElementById('total-vitacoins');
    
    if (totalStudentsElement) totalStudentsElement.textContent = analytics.totalStudents;
    if (activeTodayElement) activeTodayElement.textContent = analytics.activeToday;
    if (totalVitacoinsElement) totalVitacoinsElement.textContent = analytics.totalVitacoins.toLocaleString();
}

function updateAdminTasks() {
    console.log('Updating admin tasks...');
    const tasksContainer = document.getElementById('admin-tasks-list');
    if (!tasksContainer) {
        console.error('Admin tasks container not found');
        return;
    }
    
    tasksContainer.innerHTML = '';
    
    vitacoinApp.appData.tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'admin-task-item';
        
        const deadline = new Date(task.deadline);
        
        taskElement.innerHTML = `
            <div class="admin-task-info">
                <h5>${task.title}</h5>
                <div class="admin-task-meta">
                    Reward: ${task.reward} Vitacoins | Due: ${deadline.toLocaleDateString()}
                </div>
            </div>
            <div class="admin-task-actions">
                <button class="btn btn--sm btn--outline" onclick="editTask(${task.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn--sm btn--outline" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        tasksContainer.appendChild(taskElement);
    });
    
    // Check if create task button exists and is functional
    const createTaskBtn = document.getElementById('create-task-btn');
    if (createTaskBtn) {
        console.log('Create task button found in admin dashboard');
        createTaskBtn.style.display = 'block';
        createTaskBtn.disabled = false;
    } else {
        console.error('Create task button not found in admin dashboard');
    }
}

function updateRecentActivity() {
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;
    
    activityContainer.innerHTML = '';
    
    const recentTransactions = vitacoinApp.appData.transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    recentTransactions.forEach(transaction => {
        const user = vitacoinApp.appData.users.find(u => u.id === transaction.userId);
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        
        const date = new Date(transaction.date);
        
        activityElement.innerHTML = `
            <div class="activity-time">${date.toLocaleString()}</div>
            <div class="activity-text">
                ${user ? user.name : 'Unknown User'} ${transaction.type === 'reward' ? 'earned' : 'lost'} ${Math.abs(transaction.amount)} Vitacoins
                - ${transaction.description}
            </div>
        `;
        
        activityContainer.appendChild(activityElement);
    });
}

function setupModalHandlers() {
    console.log('Setting up modal handlers...');
    
    // Create task modal
    const createTaskBtn = document.getElementById('create-task-btn');
    const createTaskModal = document.getElementById('create-task-modal');
    const closeTaskModal = document.getElementById('close-task-modal');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const createTaskForm = document.getElementById('create-task-form');
    
    console.log('Modal elements found:', {
        createTaskBtn: !!createTaskBtn,
        createTaskModal: !!createTaskModal,
        closeTaskModal: !!closeTaskModal,
        cancelTaskBtn: !!cancelTaskBtn,
        createTaskForm: !!createTaskForm
    });
    
    if (createTaskBtn && createTaskModal) {
        createTaskBtn.addEventListener('click', () => {
            console.log('Create task button clicked');
            createTaskModal.classList.remove('hidden');
        });
    }
    
    if (closeTaskModal && createTaskModal) {
        closeTaskModal.addEventListener('click', () => {
            console.log('Close task modal clicked');
            createTaskModal.classList.add('hidden');
        });
    }
    
    if (cancelTaskBtn && createTaskModal) {
        cancelTaskBtn.addEventListener('click', () => {
            console.log('Cancel task button clicked');
            createTaskModal.classList.add('hidden');
        });
    }
    
    if (createTaskForm) {
        console.log('Setting up create task form submit handler');
        createTaskForm.addEventListener('submit', handleCreateTask);
    }
    
    // Penalty settings
    const savePenaltiesBtn = document.getElementById('save-penalties-btn');
    if (savePenaltiesBtn) {
        savePenaltiesBtn.addEventListener('click', savePenaltySettings);
    }
}

function handleCreateTask(e) {
    e.preventDefault();
    
    console.log('Creating new task...');
    console.log('Event:', e);
    
    const titleElement = document.getElementById('task-title');
    const descriptionElement = document.getElementById('task-description');
    const rewardElement = document.getElementById('task-reward');
    const deadlineElement = document.getElementById('task-deadline');
    
    console.log('Form elements found:', {
        titleElement: !!titleElement,
        descriptionElement: !!descriptionElement,
        rewardElement: !!rewardElement,
        deadlineElement: !!deadlineElement
    });
    
    if (!titleElement || !descriptionElement || !rewardElement || !deadlineElement) {
        console.error('Form elements not found');
        vitacoinApp.showNotification('error', 'Form elements not found. Please refresh the page.');
        return;
    }
    
    const title = titleElement.value.trim();
    const description = descriptionElement.value.trim();
    const reward = parseInt(rewardElement.value);
    const deadline = deadlineElement.value;
    
    console.log('Form values:', { title, description, reward, deadline });
    
    if (!title || !description || !reward || !deadline) {
        vitacoinApp.showNotification('error', 'Please fill in all fields');
        return;
    }
    
    if (reward <= 0) {
        vitacoinApp.showNotification('error', 'Reward must be greater than 0');
        return;
    }
    
    try {
        console.log('Calling vitacoinApp.createTask...');
        const newTask = vitacoinApp.createTask({
            title,
            description,
            reward,
            deadline,
            type: 'assignment' // Default type
        });
        
        console.log('Task created successfully:', newTask);
        
        vitacoinApp.showNotification('success', `Task "${title}" created successfully!`);
        
        // Close modal
        const modal = document.getElementById('create-task-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Reset form
        const form = document.getElementById('create-task-form');
        if (form) {
            form.reset();
        }
        
        // Update UI
        updateAdminTasks();
        updateAvailableTasks();
        
    } catch (error) {
        console.error('Error creating task:', error);
        vitacoinApp.showNotification('error', 'Failed to create task. Please try again.');
    }
}

function editTask(taskId) {
    const task = vitacoinApp.appData.tasks.find(t => t.id === taskId);
    if (task) {
        vitacoinApp.showNotification('info', 'Task editing functionality would be implemented here.');
    }
}

function deleteTask(taskId) {
    const taskIndex = vitacoinApp.appData.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const task = vitacoinApp.appData.tasks[taskIndex];
        vitacoinApp.appData.tasks.splice(taskIndex, 1);
        vitacoinApp.showNotification('success', `Task "${task.title}" deleted successfully.`);
        updateAdminTasks();
        updateAvailableTasks();
    }
}

function savePenaltySettings() {
    const deadlinePenaltyElement = document.getElementById('deadline-penalty');
    const inactivityPenaltyElement = document.getElementById('inactivity-penalty');
    
    if (deadlinePenaltyElement && inactivityPenaltyElement) {
        const deadlinePenalty = parseInt(deadlinePenaltyElement.value);
        const inactivityPenalty = parseInt(inactivityPenaltyElement.value);
        
        vitacoinApp.appData.systemSettings.deadlinePenalty = deadlinePenalty;
        vitacoinApp.appData.systemSettings.inactivityPenalty = inactivityPenalty;
        
        vitacoinApp.saveToStorage('systemSettings', vitacoinApp.appData.systemSettings);
        vitacoinApp.showNotification('success', 'Penalty settings saved successfully!');
    }
}

function logout() {
    console.log('Logging out...');
    
    try {
        // Update user activity before logout
        if (currentUser) {
            vitacoinApp.updateUser(currentUser.id, {
                lastActivity: new Date().toISOString()
            });
        }
        
        // Clear current user
        currentUser = null;
        lastClaimDate = null;
        
        // Clear saved login state
        clearSavedLoginState();
        
        // Show logout notification
        vitacoinApp.showNotification('info', 'You have been logged out successfully.');
        
        // Reset to authentication screen
        const authSection = document.getElementById('auth-section');
        const appSection = document.getElementById('app-section');
        
        if (authSection && appSection) {
            authSection.classList.remove('hidden');
            appSection.classList.add('hidden');
        }
        
        // Clear forms
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (loginForm) loginForm.reset();
        if (signupForm) signupForm.reset();
        
        // Reset to login tab
        switchAuthTab('login');
        
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

// Enhanced Penalty System
function checkAndApplyPenalties() {
    const now = new Date();
    const students = vitacoinApp.appData.users.filter(u => u.role === 'student');

    students.forEach(student => {
        const lastActivity = new Date(student.lastActivity);
        const daysInactive = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

        if (daysInactive > 1 && daysInactive <= vitacoinApp.appData.systemSettings.maxInactivityDays) {
            const penalty = vitacoinApp.appData.systemSettings.inactivityPenalty;
            vitacoinApp.addTransaction(student.id, 'penalty', -penalty, `Inactivity penalty (${daysInactive} days)`);
            
            // Update user in current session if they're logged in
            if (currentUser && currentUser.id === student.id) {
                currentUser.vitacoins += -penalty;
                updateVitacoinBalance();
            }
        }
    });
}

// Enhanced Task Submission System
function submitTask(taskId) {
    if (!currentUser) return;
    
    const task = vitacoinApp.appData.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Check if already submitted
    const existingSubmission = task.submissions.find(s => s.userId === currentUser.id);
    if (existingSubmission) {
        vitacoinApp.showNotification('info', 'You have already submitted this task.');
        return;
    }
    
    // Simple submission (in a real app, this would have a form)
    const submission = prompt(`Submit your work for "${task.title}":`);
    if (!submission) return;
    
    const submissionData = vitacoinApp.submitTask(currentUser.id, taskId, submission);
    
    if (submissionData) {
        vitacoinApp.showNotification('success', `Task submitted successfully! Check your transaction history for details.`);
        
        // Update UI
        updateVitacoinBalance();
        updateUserStats();
        updateLeaderboard();
        updateAvailableTasks();
    }
}









// Enhanced Penalty Settings
function savePenaltySettings() {
    const deadlinePenaltyElement = document.getElementById('deadline-penalty');
    const inactivityPenaltyElement = document.getElementById('inactivity-penalty');
    
    if (deadlinePenaltyElement && inactivityPenaltyElement) {
        const deadlinePenalty = parseInt(deadlinePenaltyElement.value);
        const inactivityPenalty = parseInt(inactivityPenaltyElement.value);
        
        vitacoinApp.appData.systemSettings.deadlinePenalty = deadlinePenalty;
        vitacoinApp.appData.systemSettings.inactivityPenalty = inactivityPenalty;
        
        vitacoinApp.saveToStorage('systemSettings', vitacoinApp.appData.systemSettings);
        vitacoinApp.showNotification('success', 'Penalty settings saved successfully!');
    }
}

// Enhanced Task Management


// Enhanced Available Tasks with Submission
function updateAvailableTasks() {
    const tasksContainer = document.getElementById('available-tasks');
    if (!tasksContainer) return;
    
    tasksContainer.innerHTML = '';
    
    vitacoinApp.appData.tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        
        const deadline = new Date(task.deadline);
        const formattedDeadline = deadline.toLocaleDateString();
        const isOverdue = deadline < new Date();
        const hasSubmitted = task.submissions.some(s => s.userId === currentUser?.id);
        
        let statusClass = '';
        let statusText = '';
        
        if (hasSubmitted) {
            statusClass = 'completed';
            statusText = 'Submitted';
        } else if (isOverdue) {
            statusClass = 'overdue';
            statusText = 'Overdue';
        } else {
            statusClass = 'available';
            statusText = 'Available';
        }
        
        taskElement.innerHTML = `
            <div class="task-header">
                <h4 class="task-title">${task.title}</h4>
                <span class="task-reward">+${task.reward}</span>
            </div>
            <div class="task-description">${task.description}</div>
            <div class="task-deadline ${isOverdue ? 'overdue' : ''}">Due: ${formattedDeadline}</div>
            <div class="task-status ${statusClass}">${statusText}</div>
            ${!hasSubmitted && !isOverdue ? `<button class="btn btn--sm btn--primary" onclick="submitTask(${task.id})">Submit Task</button>` : ''}
        `;
        
        tasksContainer.appendChild(taskElement);
    });
}

// Enhanced Transaction History with Better Filtering
function showTransactionHistory() {
    if (!currentUser) return;
    
    const userTransactions = vitacoinApp.appData.transactions
        .filter(t => t.userId === currentUser.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    renderTransactions(userTransactions);
}

// Enhanced Filter Transactions
function filterTransactions() {
    const filter = document.getElementById('transaction-filter');
    const sort = document.getElementById('transaction-sort');
    
    if (!filter || !sort || !currentUser) return;
    
    let filtered = vitacoinApp.appData.transactions.filter(t => t.userId === currentUser.id);
    
    if (filter.value !== 'all') {
        filtered = filtered.filter(t => t.type === filter.value);
    }
    
    applySort(filtered, sort.value);
    renderTransactions(filtered);
}

// Enhanced Admin Stats
function updateAdminStats() {
    const analytics = vitacoinApp.getAnalytics();
    
    const totalStudentsElement = document.getElementById('total-students');
    const activeTodayElement = document.getElementById('active-today');
    const totalVitacoinsElement = document.getElementById('total-vitacoins');
    
    if (totalStudentsElement) totalStudentsElement.textContent = analytics.totalStudents;
    if (activeTodayElement) activeTodayElement.textContent = analytics.activeToday;
    if (totalVitacoinsElement) totalVitacoinsElement.textContent = analytics.totalVitacoins.toLocaleString();
}





// Initialize enhanced functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing enhanced Vitacoin app...');
    
    // Initialize the application
    vitacoinApp.startAutoSave();
    vitacoinApp.startPenaltyCheck();
    startAutoSave();
    startPenaltyCheck();
    
    // Check for saved login state
    checkSavedLogin();
    
    // Initialize authentication
    initializeAuth();
    setupEventListeners();
    
    // Set up session validation
    setInterval(() => {
        if (currentUser && !vitacoinApp.validateSession()) {
            console.log('Session expired, logging out user');
            logout();
        }
    }, 60000); // Check every minute
    
    // Set up user activity tracking
    document.addEventListener('click', updateUserActivity);
    document.addEventListener('keypress', updateUserActivity);
    document.addEventListener('scroll', updateUserActivity);
    
    console.log('Vitacoin application initialized successfully');
});

// Global functions for onclick handlers
window.editTask = editTask;
window.deleteTask = deleteTask;
window.submitTask = submitTask;

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function formatCurrency(amount) {
    return amount.toLocaleString() + ' Vitacoins';
}