import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private apiService: ApiService,
  ) {}

  login(data: any) {
    return this.apiService.post('/auth/login', data);
  }
}
