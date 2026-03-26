import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface LoginResponse {
  token: string;
  usuario: { id: string; email: string; nombre: string };
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string | null = null;

  constructor(private http: HttpClient) {
    this.cargarToken();
  }

  /**
   * Carga el token JWT desde almacenamiento local
   */
  private async cargarToken(): Promise<void> {
    const { value } = await Preferences.get({ key: TOKEN_KEY });
    this.token = value;
  }

  /**
   * Login con credenciales - consume API REST con JWT
   * En modo demo usa almacenamiento local si no hay API
   */
  login(email: string, password: string): Observable<LoginResponse | null> {
    const apiUrl = environment.apiUrl;

    if (apiUrl) {
      return this.http
        .post<LoginResponse>(`${apiUrl}/auth/login`, { email, password })
        .pipe(
          tap(async (response) => {
            await this.guardarSesion(response.token, response.usuario);
          }),
          catchError(() => of(null))
        );
    }

    // Modo demo: simula login para desarrollo sin API
    const usuarioDemo: Usuario = {
      id: '1',
      email: email,
      nombre: email.split('@')[0],
    };
    const tokenDemo = this.generarTokenDemo(usuarioDemo);

    return of({
      token: tokenDemo,
      usuario: usuarioDemo,
    }).pipe(
      tap(async (response) => {
        await this.guardarSesion(response.token, response.usuario);
      })
    );
  }

  /**
   * Genera un token JWT simulado para modo demo
   */
  private generarTokenDemo(usuario: Usuario): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: usuario.id,
        email: usuario.email,
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
    );
    const signature = btoa('firma_demo');
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Guarda la sesión en almacenamiento local
   */
  private async guardarSesion(
    token: string,
    usuario: Usuario
  ): Promise<void> {
    this.token = token;
    await Preferences.set({ key: TOKEN_KEY, value: token });
    await Preferences.set({
      key: USER_KEY,
      value: JSON.stringify(usuario),
    });
  }

  /**
   * Cierra la sesión
   */
  async logout(): Promise<void> {
    this.token = null;
    await Preferences.remove({ key: TOKEN_KEY });
    await Preferences.remove({ key: USER_KEY });
  }

  /**
   * Verifica si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    await this.cargarToken();
    if (!this.token) return false;

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el token JWT actual
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Obtiene el usuario actual desde almacenamiento
   */
  async getUsuario(): Promise<Usuario | null> {
    const { value } = await Preferences.get({ key: USER_KEY });
    return value ? JSON.parse(value) : null;
  }
}
