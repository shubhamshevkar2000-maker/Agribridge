const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Request] ${options.method || 'GET'} ${url}`, {
      headers: Object.fromEntries(headers.entries()),
      body: options.body
    });
  }

  try {
    const response = await fetch(url, { ...options, headers });
    
    let responseBody: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${options.method || 'GET'} ${url} Status: ${response.status}`, responseBody);
    }

    if (!response.ok) {
      const errorMsg = typeof responseBody === 'object' && responseBody !== null && responseBody.message 
        ? responseBody.message 
        : `HTTP error! Status: ${response.status}`;
      throw new ApiError(errorMsg, response.status, responseBody);
    }

    return responseBody;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (process.env.NODE_ENV === 'development') {
      console.error(`[API Network Error] ${options.method || 'GET'} ${url}`, error);
    }
    throw new ApiError(
      error.message || 'Network error, server could be offline or unreachable.',
      0,
      { message: 'Network error' }
    );
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T = any>(endpoint: string, body: any, options?: RequestInit) => 
    request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
    
  put: <T = any>(endpoint: string, body: any, options?: RequestInit) => 
    request<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
    
  delete: <T = any>(endpoint: string, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'DELETE' })
};
