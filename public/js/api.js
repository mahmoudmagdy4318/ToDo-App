// API Error class for handling server errors
export class ApiError extends Error {
  constructor(problemDetails) {
    super(problemDetails.detail || 'An error occurred');
    this.name = 'ApiError';
    this.problemDetails = problemDetails;
  }

  get status() {
    return this.problemDetails.status;
  }

  get traceId() {
    return this.problemDetails.traceId;
  }
}

export class ApiClient {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  buildUrl(endpoint) {
    // Ensure single leading slash for endpoint
    const path = `${this.baseUrl.replace(/\/$/, '')}/${String(endpoint).replace(/^\//, '')}`;
    return new URL(path, window.location.origin);
  }

  async get(endpoint, params = {}) {
    const url = this.buildUrl(endpoint);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      const problemDetails = await response.json();
      throw new ApiError(problemDetails);
    }
    
    return response.json();
  }

  async post(endpoint, data = {}) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-correlation-id': (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const problemDetails = await response.json();
      throw new ApiError(problemDetails);
    }

    return response.json();
  }

  async patch(endpoint, data = {}) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'x-correlation-id': (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const problemDetails = await response.json();
      throw new ApiError(problemDetails);
    }

    return response.json();
  }

  async delete(endpoint) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: 'DELETE',
      headers: {
        'x-correlation-id': (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
      }
    });

    if (!response.ok && response.status !== 404) {
      const problemDetails = await response.json();
      throw new ApiError(problemDetails);
    }
    
    return response.status !== 204 ? response.json() : null;
  }
}
