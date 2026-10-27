import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
  Router,
} from '@angular/router';
import { AuthService } from '../core/auth.service';
import { apiInterceptor } from '../core/api.interceptor';
import { staffGuard } from '../core/auth.guards';
import { Reservas } from './reservas/reservas';
import { Perfil } from './perfil/perfil';
import { Comisiones } from './comisiones/comisiones';
import { Clases } from './clases/clases';

describe('Sprint 2: flujos de usuario', () => {
  // jsdom no implementa la apertura de diálogos nativos; el flujo real se verifica en navegador.
  beforeAll(() =>
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      },
    }),
  );
  afterAll(() => Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal'));
  let http: HttpTestingController;
  let auth: AuthService;
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
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });
  afterEach(() => http.verify());
  function login(rol = 'PROFESOR') {
    auth.login('ana@test.com', 'Password1').subscribe();
    http
      .expectOne('/api/usuarios/me')
      .flush({ id: 41, nombre: 'Ana', email: 'ana@test.com', rol, materiasIds: [2] });
  }
  function reservas() {
    login();
    const fixture = TestBed.createComponent(Reservas);
    http.expectOne('/api/reservas').flush([]);
    http
      .expectOne('/api/aulas')
      .flush([{ id: 5, nombre: 'Aula Sur', capacidad: 40, tipo: 'AULA' }]);
    http
      .expectOne('/api/comision/mis-comisiones')
      .flush([{ id: 3, materiaNombre: 'Programación', horario: 'MAÑANA' }]);
    return fixture;
  }
  const reserva = {
    id: 8,
    id_comision: 3,
    id_aula: 5,
    fecha: '2026-10-26',
    horaInicio: '08:00',
    horaFin: '10:00',
    aulaNombre: 'Aula Sur',
    materiaNombre: 'Programación',
    profesorNombre: 'Ana',
    estadoReserva: 'RESERVADA' as const,
    propia: true,
    editable: true,
  };

  it('pide confirmar la liberación, evita doble envío y recarga al guardar', async () => {
    const fixture = reservas();
    const page = fixture.componentInstance;
    page.open();
    page.formModel.set({
      id_comision: String(reserva.id_comision),
      id_aula: String(reserva.id_aula),
      fecha: reserva.fecha,
      horaInicio: reserva.horaInicio,
      horaFin: reserva.horaFin,
    });
    page.save();
    page.save();
    const first = http.expectOne('/api/reservas');
    expect(first.request.body.liberarClaseFija).toBe(false);
    first.flush(
      {
        message:
          'CONFIRMACION_LIBERAR_AULA: El 2026-10-26 se liberará Aula Norte para usar Aula Sur.',
      },
      { status: 400, statusText: 'Bad Request' },
    );
    await fixture.whenStable();
    expect(page.state.opened()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Aula Norte');
    expect(fixture.nativeElement.textContent).toContain('Aula Sur');
    page.save(true);
    const confirmed = http.expectOne('/api/reservas');
    expect(confirmed.request.body.liberarClaseFija).toBe(true);
    confirmed.flush(reserva);
    http.expectOne('/api/reservas').flush([reserva]);
    expect(page.state.opened()).toBe(false);
    expect(page.data.items()).toHaveLength(1);
  });
  it('mantiene el formulario y sus datos cuando el horario ya está ocupado', () => {
    const page = reservas().componentInstance;
    page.open(reserva);
    page.save();
    http
      .expectOne('/api/reservas/8')
      .flush({ message: 'El aula ya está ocupada.' }, { status: 400, statusText: 'Bad Request' });
    expect(page.state.opened()).toBe(true);
    expect(page.state.error()).toContain('ocupada');
    expect(page.formModel().fecha).toBe('2026-10-26');
  });
  it('cancela solo al confirmar y actualiza la disponibilidad mostrada', () => {
    const page = reservas().componentInstance;
    page.confirm(reserva);
    http.expectNone('/api/reservas/cancelar/8');
    page.remove();
    http.expectOne('/api/reservas/cancelar/8').flush(null);
    http.expectOne('/api/reservas').flush([]);
    expect(page.state.deleting()).toBeNull();
    expect(page.state.success()).toContain('cancelada');
  });
  it('el historial solo muestra el período, autor y estado elegidos', () => {
    const page = reservas().componentInstance;
    page.data.items.set([
      reserva,
      { ...reserva, id: 9, propia: false },
      { ...reserva, id: 10, estadoReserva: 'FINALIZADA' },
    ]);
    page.history.set('FINALIZADA');
    page.scope.set('mias');
    page.fecha.set('2026-10-26');
    expect(page.filtered().map((r) => r.id)).toEqual([10]);
    page.fecha.set('2026-10-27');
    expect(page.filtered()).toEqual([]);
  });
  it('envía el id del profesor, no el id de su cuenta', () => {
    login('ADMIN');
    const page = TestBed.createComponent(Comisiones).componentInstance;
    http.expectOne('/api/comision').flush([]);
    http.expectOne('/api/materias').flush([{ id: 2, nombre: 'Programación' }]);
    http.expectOne('/api/aulas').flush([]);
    http
      .expectOne('/api/profesores')
      .flush([{ id: 3, usuarioId: 41, nombre: 'Ana', materiasIds: [2] }]);
    page.open();
    page.formModel.set({
      id_materia: '2',
      id_profesor: '3',
      cantAlumnos: 20,
      horario: 'MAÑANA',
      fechaInicio: '2026-10-01',
      fechaFin: '2027-01-01',
    });
    page.save();
    const request = http.expectOne('/api/comision');
    expect(request.request.body.id_profesor).toBe(3);
    expect(request.request.body.claseFija).toBeUndefined();
    request.flush({ id: 1 });
    http.expectOne('/api/comision').flush([]);
  });
  it('cambiar correo obliga a iniciar sesión con las nuevas credenciales', () => {
    login();
    const page = TestBed.createComponent(Perfil).componentInstance;
    page.formModel.update((value) => ({ ...value, email: 'nueva@test.com' }));
    page.save();
    const request = http.expectOne('/api/usuarios/me');
    expect(request.request.body.rol).toBeUndefined();
    expect(request.request.body.materiasIds).toBeUndefined();
    request.flush({
      id: 41,
      nombre: 'Ana',
      email: 'nueva@test.com',
      rol: 'PROFESOR',
      materiasIds: [2],
    });
    expect(auth.user()).toBeNull();
    expect(auth.authorization).toBeNull();
    expect(auth.notice()).toContain('nuevos datos');
  });
  it('editar el nombre conserva la sesión', () => {
    login();
    const page = TestBed.createComponent(Perfil).componentInstance;
    page.formModel.update((value) => ({ ...value, nombre: 'Ana María' }));
    page.save();
    http.expectOne('/api/usuarios/me').flush({
      id: 41,
      nombre: 'Ana María',
      email: 'ana@test.com',
      rol: 'PROFESOR',
      materiasIds: [2],
    });
    expect(auth.user()?.nombre).toBe('Ana María');
    expect(auth.authorization).not.toBeNull();
  });
  it('el alumno consulta el aula efectiva y no tiene acciones de escritura', async () => {
    login('ALUMNO');
    const fixture = TestBed.createComponent(Clases);
    http
      .expectOne((r) => r.url === '/api/clases')
      .flush([
        {
          comisionId: 3,
          materiaId: 2,
          materiaNombre: 'Programación',
          profesorNombre: 'Ana',
          aulaId: 5,
          aulaNombre: 'Aula Sur',
          fecha: '2026-10-26',
          horaInicio: '08:00',
          horaFin: '10:00',
          origen: 'RESERVA',
        },
      ]);
    http.expectOne('/api/materias').flush([]);
    http.expectOne('/api/aulas').flush([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Aula Sur');
    expect(fixture.nativeElement.textContent).not.toMatch(/Editar|Eliminar|Cancelar reserva/);
    const denied = TestBed.runInInjectionContext(() =>
      staffGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect((denied as UrlTree).toString()).toBe('/sin-acceso');
  });
});
