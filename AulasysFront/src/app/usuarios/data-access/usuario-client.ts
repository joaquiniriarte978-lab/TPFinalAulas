import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { PerfilInput, Usuario, UsuarioInput } from './usuario';

@Service()
export class UsuarioClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/usuarios';

  getPerfil() {
    return this.http.get<Usuario>(`${this.baseUrl}/me`);
  }

  editPerfil(edittedPerfil: PerfilInput) {
    return this.http.put<Usuario>(`${this.baseUrl}/me`, edittedPerfil);
  }

  getAllUsuarios() {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  getUsuarioById(id: number | string) {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  addUsuario(newUsuario: UsuarioInput) {
    return this.http.post<Usuario>(this.baseUrl, newUsuario);
  }

  editUsuario(edittedUsuario: UsuarioInput, id: number | string) {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, edittedUsuario);
  }

  deleteUsuario(id: number | string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
