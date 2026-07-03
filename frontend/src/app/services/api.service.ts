import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`);
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }

  postFormData<T>(path: string, formData: FormData, method: 'POST' | 'PUT' = 'POST'): Observable<T> {
    const url = `${this.baseUrl}${path}`;
    if (method === 'PUT') {
      return this.http.put<T>(url, formData);
    }
    return this.http.post<T>(url, formData);
  }

  downloadFile(path: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${path}`, {
      responseType: 'blob'
    });
  }
}
