import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email = '';
  password = '';
  error = '';
  cargando = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async login() {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Ingresa email y contraseña';
      return;
    }

    this.cargando = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response) {
          this.router.navigate(['/home']);
        } else {
          this.error = 'Credenciales incorrectas';
        }
      },
      error: () => {
        this.cargando = false;
        this.error = 'Error de conexión. Modo demo: usa cualquier email y contraseña.';
      },
    });
  }
}
