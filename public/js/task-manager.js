export class TaskManager {
  constructor(apiClient, toastManager, uiStateManager) {
    this.api = apiClient;
    this.toast = toastManager;
    this.uiState = uiStateManager;
    this.tasks = [];
    this.pagination = { page: 1, pages: 1, total: 0, limit: 25 };
  }

  async loadTasks(showLoading = true) {
    try {
      if (showLoading) {
        this.showLoading();
      }

      const filters = this.uiState.getFilters();
      const response = await this.api.get('/tasks', filters);
      
      this.tasks = response.data;
      this.pagination = response.pagination;
      
      this.renderTasks();
      this.renderPagination();
      this.updateTaskCount();
      
    } catch (error) {
      console.error('Failed to load tasks:', error);
      this.toast.error(`Failed to load tasks: ${error.message}`);
      this.renderErrorState();
    } finally {
      if (showLoading) {
        this.hideLoading();
      }
    }
  }

  async createTask(raw) {
    try {
      const taskData = this.prepareTaskData(raw);
      const task = await this.api.post('/tasks', taskData);
      
      // Add to beginning of current tasks if on first page
      if (this.uiState.filters.page === 1) {
        this.tasks.unshift(task);
        this.renderTasks();
      }
      
      this.toast.success('Task created successfully!');
      this.updateTaskCount();
      
      // Reload to get accurate pagination
      await this.loadTasks(false);
      
      return task;
    } catch (error) {
      console.error('Failed to create task:', error);
      this.toast.error(`Failed to create task: ${error.message}`);
      throw error;
    }
  }

  async updateTask(id, data) {
    try {
      const task = await this.api.patch(`/tasks/${id}`, data);
      
      // Update local task data
      const index = this.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        this.tasks[index] = task;
        this.renderTasks();
      }
      
      this.toast.success('Task updated successfully!');
      return task;
    } catch (error) {
      console.error('Failed to update task:', error);
      this.toast.error(`Failed to update task: ${error.message}`);
      throw error;
    }
  }

  async toggleComplete(taskId) {
    try {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = await this.api.patch(`/tasks/${taskId}/toggle`, {
        version: task.version
      });

      // Update local task data
      const index = this.tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
        this.renderTasks();
      }

      return updatedTask;
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      this.toast.error(`Failed to update task: ${error.message}`);
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      await this.api.delete(`/tasks/${taskId}`);
      
      // Remove from local tasks
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.renderTasks();
      this.updateTaskCount();
      
      this.toast.success('Task deleted successfully!');
      
      // Reload to get accurate pagination
      await this.loadTasks(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
      this.toast.error(`Failed to delete task: ${error.message}`);
      throw error;
    }
  }

  renderTasks() {
    const container = document.getElementById('task-list');
    const template = document.getElementById('task-item-template');
    const noTasksTemplate = document.getElementById('no-tasks-template');

    container.innerHTML = '';

    if (this.tasks.length === 0) {
      const noTasksElement = noTasksTemplate.content.cloneNode(true);
      container.appendChild(noTasksElement);
      return;
    }

    this.tasks.forEach(task => {
      const element = this.createTaskElement(task, template);
      container.appendChild(element);
    });
  }

  createTaskElement(task, template) {
    const element = template.content.cloneNode(true);
    const taskItem = element.querySelector('.task-item');
    
    // Set data attributes
    taskItem.setAttribute('data-task-id', task.id);
    
    // Add priority and status classes
    taskItem.classList.add(`priority-${task.priority.toLowerCase()}`);
    if (task.completed) {
      taskItem.classList.add('completed');
    }
    if (task.isOverdue) {
      taskItem.classList.add('overdue');
    }

    // Set checkbox state
    const checkbox = element.querySelector('.task-completed');
    checkbox.checked = task.completed;
    checkbox.id = `task-${task.id}`;
    
    // Update checkbox label
    const label = element.querySelector('.form-check-label');
    label.setAttribute('for', `task-${task.id}`);

    // Fill content
    element.querySelector('.task-title').textContent = task.title;
    element.querySelector('.task-description').textContent = task.description || '';
    
    // Format and display due date
    const dueDateElement = element.querySelector('.task-due-date');
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDateElement.textContent = `Due: ${dueDate.toLocaleDateString()}`;
      if (task.isOverdue) {
        dueDateElement.classList.add('text-danger', 'fw-bold');
      }
    } else {
      dueDateElement.textContent = '';
    }

    // Set priority badge
    const priorityBadge = element.querySelector('.task-priority');
    priorityBadge.textContent = task.priority;
    priorityBadge.className = `badge ${this.getPriorityBadgeClass(task.priority)}`;

    // Display tags
    const tagsElement = element.querySelector('.task-tags');
    if (task.tags && task.tags.length > 0) {
      tagsElement.innerHTML = task.tags
        .map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`)
        .join('');
    }

    // Set up event listeners
    checkbox.addEventListener('change', () => this.toggleComplete(task.id));
    
    const editBtn = element.querySelector('.btn-edit');
    editBtn.addEventListener('click', () => this.editTask(task.id));
    
    const deleteBtn = element.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => this.confirmDeleteTask(task.id));

    return element;
  }

  renderPagination() {
    const container = document.getElementById('pagination-container');
    
    if (this.pagination.pages <= 1) {
      container.innerHTML = '';
      return;
    }

    const { page, pages } = this.pagination;
    let paginationHtml = '<nav><ul class="pagination pagination-sm justify-content-center mb-0">';

    // Previous button
    if (page > 1) {
      paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${page - 1}">Previous</a></li>`;
    }

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(pages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === page ? 'active' : '';
      paginationHtml += `<li class="page-item ${isActive}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }

    // Next button
    if (page < pages) {
      paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${page + 1}">Next</a></li>`;
    }

    paginationHtml += '</ul></nav>';
    
    container.innerHTML = paginationHtml;

    // Add click handlers
    container.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const newPage = parseInt(e.target.getAttribute('data-page'));
        this.uiState.setPage(newPage);
        this.loadTasks();
      });
    });
  }

  updateTaskCount() {
    const countElement = document.getElementById('task-count');
    const total = this.pagination.total;
    countElement.textContent = `${total} task${total !== 1 ? 's' : ''}`;
  }

  getPriorityBadgeClass(priority) {
    switch (priority) {
      case 'HIGH': return 'badge bg-danger task-priority';
      case 'MEDIUM': return 'badge bg-warning task-priority';
      case 'LOW': return 'badge bg-success task-priority';
      default: return 'badge bg-secondary task-priority';
    }
  }

  prepareTaskData(input) {
    // Supports FormData or plain object
    const isFormData = input && typeof input.get === 'function';

    const getVal = (key) => {
      if (isFormData) return input.get(key);
      return input?.[key];
    };

    const titleRaw = getVal('title') || '';
    const descriptionRaw = getVal('description') || '';

    const data = {
      title: String(titleRaw).trim(),
      description: descriptionRaw ? String(descriptionRaw).trim() : null,
      priority: getVal('priority') || 'MEDIUM',
      dueDate: getVal('dueDate') || null
    };

    // Parse tags
    const tagsInput = getVal('tags');
    if (tagsInput) {
      data.tags = String(tagsInput)
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }

    return data;
  }

  showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.remove('d-none');
    }
  }

  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('d-none');
    }
  }

  renderErrorState() {
    const container = document.getElementById('task-list');
    container.innerHTML = `
      <div class="list-group-item text-center py-4">
        <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
        <p class="text-danger mb-2 mt-2">Failed to load tasks</p>
        <button class="btn btn-outline-primary btn-sm" onclick="window.taskManager.loadTasks()">
          <i class="bi bi-arrow-clockwise me-1"></i>Try Again
        </button>
      </div>
    `;
  }

  async confirmDeleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      await this.deleteTask(taskId);
    }
  }

  editTask(taskId) {
    // For MVP, we'll implement simple inline editing later
    // For now, just show a placeholder
    this.toast.info('Task editing will be available soon!');
  }
}
