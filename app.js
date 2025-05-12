// User Authentication and Todo App
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authContainer = document.getElementById('auth-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const appContainer = document.getElementById('app-container');
    const todoList = document.getElementById('todo-list');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const modal = document.getElementById('todo-modal');
    const closeModal = document.querySelector('.close');
    const saveTodoBtn = document.getElementById('save-todo-btn');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    
    // Form fields
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const registerName = document.getElementById('register-name');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const todoTitle = document.getElementById('todo-title');
    const todoDescription = document.getElementById('todo-description');
    const todoDueDate = document.getElementById('todo-due-date');
    
    // Error elements
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const todoError = document.getElementById('todo-error');
    
    // State variables
    let currentUser = null;
    let editingTodoId = null;
    
    // Initialize the app
    init();
    
    function init() {
        // Check if user is already logged in
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            currentUser = user;
            showApp();
        } else {
            showAuth();
        }
        
        // Set up event listeners
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Auth form toggles
        showRegister.addEventListener('click', () => {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            clearErrors();
        });
        
        showLogin.addEventListener('click', () => {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            clearErrors();
        });
        
        // Login button
        document.getElementById('login-btn').addEventListener('click', handleLogin);
        
        // Register button
        document.getElementById('register-btn').addEventListener('click', handleRegister);
        
        // Logout button
        logoutBtn.addEventListener('click', handleLogout);
        
        // Add todo button
        addTodoBtn.addEventListener('click', () => openModal());
        
        // Modal close button
        closeModal.addEventListener('click', () => closeModalWindow());
        
        // Save todo button
        saveTodoBtn.addEventListener('click', saveTodo);
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModalWindow();
            }
        });
    }
    
    function clearErrors() {
        loginError.textContent = '';
        registerError.textContent = '';
        todoError.textContent = '';
    }
    
    // Auth functions
    function handleLogin() {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        
        if (!email || !password) {
            loginError.textContent = 'Please fill in all fields';
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showApp();
            clearAuthForms();
        } else {
            loginError.textContent = 'Invalid email or password';
        }
    }
    
    function handleRegister() {
        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value.trim();
        
        if (!name || !email || !password) {
            registerError.textContent = 'Please fill in all fields';
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if user already exists
        if (users.some(u => u.email === email)) {
            registerError.textContent = 'Email already registered';
            return;
        }
        
        const newUser = { id: Date.now().toString(), name, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        showApp();
        clearAuthForms();
    }
    
    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showAuth();
    }
    
    function clearAuthForms() {
        loginEmail.value = '';
        loginPassword.value = '';
        registerName.value = '';
        registerEmail.value = '';
        registerPassword.value = '';
        clearErrors();
    }
    
    // UI functions
    function showAuth() {
        authContainer.style.display = 'flex';
        appContainer.style.display = 'none';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
    
    function showApp() {
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        renderTodos();
    }
    
    // Todo functions
    function openModal(todo = null) {
        editingTodoId = todo ? todo.id : null;
        document.getElementById('modal-title').textContent = todo ? 'Edit Todo' : 'Add Todo';
        todoTitle.value = todo ? todo.title : '';
        todoDescription.value = todo ? todo.description : '';
        todoDueDate.value = todo ? formatDateForInput(todo.dueDate) : '';
        modal.style.display = 'block';
    }
    
    function closeModalWindow() {
        modal.style.display = 'none';
        editingTodoId = null;
        todoTitle.value = '';
        todoDescription.value = '';
        todoDueDate.value = '';
        todoError.textContent = '';
    }
    
    function saveTodo() {
        const title = todoTitle.value.trim();
        const description = todoDescription.value.trim();
        const dueDate = todoDueDate.value;
        
        if (!title) {
            todoError.textContent = 'Title is required';
            return;
        }
        
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        
        if (editingTodoId) {
            // Update existing todo
            const index = todos.findIndex(t => t.id === editingTodoId);
            if (index !== -1) {
                todos[index] = {
                    ...todos[index],
                    title,
                    description,
                    dueDate: dueDate ? new Date(dueDate).toISOString() : null
                };
            }
        } else {
            // Add new todo
            const newTodo = {
                id: Date.now().toString(),
                userId: currentUser.id,
                title,
                description,
                createdAt: new Date().toISOString(),
                dueDate: dueDate ? new Date(dueDate).toISOString() : null
            };
            todos.push(newTodo);
        }
        
        localStorage.setItem('todos', JSON.stringify(todos));
        closeModalWindow();
        renderTodos();
    }
    
    function renderTodos() {
        if (!currentUser) return;
        
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const userTodos = todos
            .filter(todo => todo.userId === currentUser.id)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        todoList.innerHTML = '';
        
        if (userTodos.length === 0) {
            todoList.innerHTML = '<p>No todos found. Add your first todo!</p>';
            return;
        }
        
        userTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            
            const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
            const isOverdue = dueDate && dueDate < new Date();
            
            li.innerHTML = `
                <div class="todo-title">${todo.title}</div>
                <div class="todo-description">${todo.description || 'No description'}</div>
                <div class="todo-meta">
                    <span>Created: ${formatDate(todo.createdAt)}</span>
                    <span style="color: ${isOverdue ? 'red' : '#888'}">
                        ${dueDate ? `Due: ${formatDate(dueDate)}` : 'No due date'}
                    </span>
                </div>
                <div class="todo-actions">
                    <button class="edit-btn" data-id="${todo.id}">Edit</button>
                    <button class="delete-btn" data-id="${todo.id}">Delete</button>
                </div>
            `;
            
            todoList.appendChild(li);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoId = e.target.getAttribute('data-id');
                const todos = JSON.parse(localStorage.getItem('todos')) || [];
                const todo = todos.find(t => t.id === todoId);
                if (todo) openModal(todo);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoId = e.target.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this todo?')) {
                    deleteTodo(todoId);
                }
            });
        });
    }
    
    function deleteTodo(todoId) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const updatedTodos = todos.filter(todo => todo.id !== todoId);
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
        renderTodos();
    }
    
    // Helper functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }
    
    function formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return localDateTime.toISOString().slice(0, 16);
    }
});