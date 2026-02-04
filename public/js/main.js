import { ApiClient } from './api.js';
import { ToastManager } from './toast.js';
import { UiStateManager } from './ui-state.js';
import { TaskManager } from './task-manager.js';

/**
 * Main application initialization
 */
class TodoApp {
  constructor() {
    this.api = null;
    this.toast = null;
    this.uiState = null;
    this.taskManager = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Initialize core services
      this.api = new ApiClient('/api');
      this.toast = new ToastManager();
      this.uiState = new UiStateManager();
      this.taskManager = new TaskManager(this.api, this.toast, this.uiState);

      // Initialize UI components
      this.initializeEventListeners();
      this.initializeFormHandlers();
      this.initializeKeyboardShortcuts();

      // Load initial data
      await this.taskManager.loadTasks();

      this.initialized = true;
      console.log('Todo App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Todo App:', error);
      this.toast?.error('Failed to initialize application');
    }
  }

  initializeEventListeners() {
    // Task form submission
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => this.handleTaskFormSubmit(e));
    }

    // Filter form changes
    const filtersForm = document.getElementById('filters-form');
    if (filtersForm) {
      filtersForm.addEventListener('input', (e) => this.handleFilterChange(e));
      filtersForm.addEventListener('change', (e) => this.handleFilterChange(e));
    }

    // Task list delegation
    const taskList = document.getElementById('task-list');
    if (taskList) {
      taskList.addEventListener('click', (e) => this.handleTaskListClick(e));
      taskList.addEventListener('change', (e) => this.handleTaskListChange(e));
    }

    // Pagination
    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
      paginationContainer.addEventListener('click', (e) => this.handlePaginationClick(e));
    }

    // Window events
    window.addEventListener('beforeunload', () => this.handleBeforeUnload());
  }

  initializeFormHandlers() {
    // Auto-resize textareas
    document.querySelectorAll('textarea').forEach(textarea => {
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      });
    });

    // Tag input formatting
    const tagsInput = document.getElementById('tags');
    if (tagsInput) {
      tagsInput.addEventListener('blur', () => {
        const tags = tagsInput.value
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .join(', ');
        tagsInput.value = tags;
      });
    }

    // Due date validation
    const dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) {
      dueDateInput.addEventListener('change', () => {
        const selectedDate = new Date(dueDateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          this.toast.warning('Selected due date is in the past');
        }
      });
    }
  }

  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + N: Focus new task title
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const titleInput = document.getElementById('title');
        if (titleInput) {
          titleInput.focus();
          titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // Ctrl/Cmd + F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('search');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // Escape: Clear search/cancel editing
      if (e.key === 'Escape') {
        const editingTask = document.querySelector('.task-item.editing');
        if (editingTask) {
          this.taskManager.cancelEdit(editingTask.dataset.taskId);
        } else {
          const searchInput = document.getElementById('search');
          if (searchInput && searchInput.value) {
            searchInput.value = '';
            this.handleFilterChange({ target: searchInput });
          }
        }
      }
    });
  }

  async handleTaskFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const taskData = Object.fromEntries(formData.entries());
    
    // Process tags
    if (taskData.tags) {
      taskData.tags = taskData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    try {
      await this.taskManager.createTask(taskData);
      e.target.reset();
      
      // Focus back to title for quick entry
      const titleInput = document.getElementById('title');
      if (titleInput) titleInput.focus();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }

  async handleFilterChange(e) {
    // Debounce filter changes
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(async () => {
      this.uiState.updateFiltersFromForm();
      await this.taskManager.loadTasks();
    }, 300);
  }

  async handleTaskListClick(e) {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.dataset.taskId;

    if (e.target.closest('.btn-edit')) {
      e.preventDefault();
      await this.taskManager.startEdit(taskId);
    } else if (e.target.closest('.btn-delete')) {
      e.preventDefault();
      if (confirm('Are you sure you want to delete this task?')) {
        await this.taskManager.deleteTask(taskId);
      }
    } else if (e.target.closest('.btn-save-edit')) {
      e.preventDefault();
      await this.taskManager.saveEdit(taskId);
    } else if (e.target.closest('.btn-cancel-edit')) {
      e.preventDefault();
      this.taskManager.cancelEdit(taskId);
    }
  }

  async handleTaskListChange(e) {
    if (e.target.classList.contains('task-completed')) {
      const taskItem = e.target.closest('.task-item');
      const taskId = taskItem.dataset.taskId;
      const completed = e.target.checked;
      
      await this.taskManager.updateTask(taskId, { completed });
    }
  }

  async handlePaginationClick(e) {
    e.preventDefault();
    
    const pageLink = e.target.closest('.page-link');
    if (!pageLink || pageLink.closest('.page-item.disabled')) return;

    const page = parseInt(pageLink.dataset.page);
    if (page && page !== this.uiState.filters.page) {
      this.uiState.updateFilter('page', page);
      await this.taskManager.loadTasks();
    }
  }

  handleBeforeUnload() {
    // Save any pending edits or state
    const editingTask = document.querySelector('.task-item.editing');
    if (editingTask) {
      // Could save draft or prompt user
      console.log('Task being edited:', editingTask.dataset.taskId);
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const app = new TodoApp();
  await app.init();
  
  // Make app globally available for debugging
  window.todoApp = app;
});

// Handle service worker registration for offline support (if available)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  });
}

export { TodoApp };
