import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { apiErrorMessage, apiInterceptor } from './api.interceptor';

describe('Contrato de la API', () => {
  let http: HttpTestingController;
  let api: ApiService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(ApiService);
  });
  afterEach(() => http.verify());

  it('actualiza usuarios sin reemplazar materias ni enviar una contraseña vacía', () => {
    api.saveUsuario({ nombre: 'Ana', email: 'ana@test.com', rol: 'PROFESOR' }, 3).subscribe();
    const req = http.expectOne('/api/usuarios/3');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).not.toHaveProperty('materiasIds');
    expect(req.request.body).not.toHaveProperty('password');
    req.flush({ id: 3 });
  });

  it('usa requiereLaboratorio y PUT /materias/{id} según el controlador real', () => {
    api.saveMateria({ nombre: 'Programación', requiereLaboratorio: true }, 8).subscribe();
    const req = http.expectOne('/api/materias/8');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nombre: 'Programación', requiereLaboratorio: true });
    req.flush({ id: 8 });
  });

  it('crea aulas y admite respuestas vacías al eliminar', () => {
    api.saveAula({ nombre: 'Aula 1', tipo: 'AULA', capacidad: 20, equipamiento: '' }).subscribe();
    const create = http.expectOne('/api/aulas');
    expect(create.request.method).toBe('POST');
    create.flush({ id: 1 });
    api.deleteAula(1).subscribe();
    const remove = http.expectOne('/api/aulas/1');
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null);
  });

  it('no envía credenciales fuera de /api/', () => {
    TestBed.inject(AuthService).login('admin', 'Usuario1').subscribe();
    http.expectOne('/api/usuarios/me').flush({ rol: 'ADMIN' });
    TestBed.inject(HttpClient).get('https://example.com/api/aulas').subscribe();
    const req = http.expectOne('https://example.com/api/aulas');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('muestra errores de negocio y oculta detalles internos del servidor', () => {
    expect(
      apiErrorMessage(new HttpErrorResponse({ status: 400, error: 'El email ya está registrado' })),
    ).toContain('email ya');
    expect(
      apiErrorMessage(
        new HttpErrorResponse({
          status: 409,
          error: { message: 'La materia tiene comisiones vinculadas.' },
        }),
      ),
    ).toContain('comisiones');
    expect(
      apiErrorMessage(
        new HttpErrorResponse({ status: 400, error: 'jdbc SQLException password=secret' }),
      ),
    ).not.toContain('secret');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 0 }))).toContain('servidor');
    expect(
      apiErrorMessage(new HttpErrorResponse({ status: 500, error: '<html>stacktrace</html>' })),
    ).not.toContain('html');
  });
});
