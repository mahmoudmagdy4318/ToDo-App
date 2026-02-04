export class UiStateManager {
  constructor() {
    this.filters = {
      page: 1,
      limit: 25,
      search: '',
      priority: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
  }

  loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    this.filters = {
      page: parseInt(params.get('page')) || 1,
      limit: parseInt(params.get('limit')) || 25,
      search: params.get('search') || '',
      priority: params.get('priority') || '',
      status: params.get('status') || '',
      sortBy: params.get('sortBy') || 'createdAt',
      sortOrder: params.get('sortOrder') || 'desc'
    };

    this.updateFormInputs();
  }

  updateFromForm() {
    const form = document.getElementById('filters-form');
    const formData = new FormData(form);
    
    this.filters = {
      ...this.filters,
      page: 1, // Reset to first page when filters change
      search: formData.get('search') || '',
      priority: formData.get('priority') || '',
      status: formData.get('status') || '',
      sortBy: formData.get('sortBy') || 'createdAt',
      sortOrder: formData.get('sortOrder') || 'desc'
    };

    this.updateURL();
  }

  updateURL() {
    const params = new URLSearchParams();
    
    Object.entries(this.filters).forEach(([key, value]) => {
      if (value && value !== '' && !(key === 'page' && value === 1) && !(key === 'limit' && value === 25)) {
        params.set(key, value.toString());
      }
    });

    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }

  updateFormInputs() {
    const searchInput = document.getElementById('search');
    const priorityFilter = document.getElementById('priority-filter');
    const statusFilter = document.getElementById('status-filter');
    const sortBy = document.getElementById('sort-by');
    const sortOrder = document.getElementById('sort-order');

    if (searchInput) searchInput.value = this.filters.search;
    if (priorityFilter) priorityFilter.value = this.filters.priority;
    if (statusFilter) statusFilter.value = this.filters.status;
    if (sortBy) sortBy.value = this.filters.sortBy;
    if (sortOrder) sortOrder.value = this.filters.sortOrder;
  }

  getFilters() {
    // Remove empty values for API call
    const apiFilters = {};
    Object.entries(this.filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        apiFilters[key] = value;
      }
    });
    return apiFilters;
  }

  setPage(page) {
    this.filters.page = page;
    this.updateURL();
  }

  resetFilters() {
    this.filters = {
      page: 1,
      limit: 25,
      search: '',
      priority: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.updateFormInputs();
    this.updateURL();
  }
}
