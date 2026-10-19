import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { apiInterceptor } from './api.interceptor';
import { adminGuard, authGuard, safeReturnUrl } from './auth.guards';
import { Rol, Usuario } from './models';

describe('Autenticación y permisos', () => {
  let http: HttpTestingController;
  let auth: AuthService;
  let api: ApiService;
  const user: Usuario = {
    id: 7,
    nombre: 'Ana',
    email: 'ana@test.com',
    rol: 'ADMIN',
    materiasIds: [],
  };
  function login(rol: Rol = 'ADMIN') {
    auth.login('ana@test.com', 'Contraseña1').subscribe();
    http.expectOne('/api/usuarios/me').flush({ ...user, rol });
  }
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    api = TestBed.inject(ApiService);
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });
  afterEach(() => http.verify());

  it('valida las credenciales en /me y transmite Basic UTF-8 a la API', () => {
    auth.login(' ana@test.com ', 'Contraseña1').subscribe();
    const request = http.expectOne('/api/usuarios/me');
    expect(request.request.headers.get('Authorization')).toBe(
      'Basic YW5hQHRlc3QuY29tOkNvbnRyYXNlw7FhMQ==',
    );
    expect(auth.user()).toBeNull();
    request.flush(user);
    expect(auth.isAdmin()).toBe(true);
    api.aulas().subscribe();
    expect(http.expectOne('/api/aulas').request.headers.get('Authorization')).toBe(
      auth.authorization,
    );
  });

  it('no crea una sesión con contraseña incorrecta', () => {
    let message = '';
    auth.login('ana', 'incorrecta').subscribe({ error: (err: Error) => (message = err.message) });
    http.expectOne('/api/usuarios/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(message).toContain('contraseña');
    expect(auth.user()).toBeNull();
    expect(auth.authorization).toBeNull();
  });

  it('elimina usuario y credenciales al cerrar sesión', () => {
    login();
    auth.logout();
    expect(auth.user()).toBeNull();
    expect(auth.authorization).toBeNull();
    api.aulas().subscribe();
    expect(http.expectOne('/api/aulas').request.headers.has('Authorization')).toBe(false);
  });

  it('un 401 de una sesión activa fuerza un nuevo ingreso', () => {
    login();
    api.aulas().subscribe({ error: () => {} });
    http.expectOne('/api/aulas').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(auth.user()).toBeNull();
    expect(auth.notice()).toContain('nuevamente');
  });

  it('un 403 informa el permiso sin cerrar la sesión', () => {
    login('ALUMNO');
    let message = '';
    api.usuarios().subscribe({ error: (err: Error) => (message = err.message) });
    http.expectOne('/api/usuarios').flush(null, { status: 403, statusText: 'Forbidden' });
    expect(auth.user()?.rol).toBe('ALUMNO');
    expect(message).toContain('permiso');
  });

  it.each(['ALUMNO', 'PROFESOR'] as Rol[])('bloquea la ruta de usuarios para %s', (rol) => {
    login(rol);
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect((result as UrlTree).toString()).toBe('/sin-acceso');
  });

  it('permite administración al administrador', () => {
    login();
    expect(
      TestBed.runInInjectionContext(() =>
        adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      ),
    ).toBe(true);
  });

  it('protege los enlaces directos sin sesión', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/aulas' } as RouterStateSnapshot),
    );
    expect((result as UrlTree).toString()).toBe('/login?returnUrl=%2Faulas');
  });

  it('impide redirecciones externas o fuera del sprint', () => {
    expect(safeReturnUrl('//external.test')).toBe('/inicio');
    expect(safeReturnUrl('/reservas')).toBe('/reservas');
    expect(safeReturnUrl('/reportes')).toBe('/inicio');
    expect(safeReturnUrl('/aulas?tipo=AULA')).toBe('/aulas?tipo=AULA');
  });
});
