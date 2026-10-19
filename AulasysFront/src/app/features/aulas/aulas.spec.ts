import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Aulas } from './aulas';
import { AuthService } from '../../core/auth.service';

describe('Consulta de aulas', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Aulas],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  const aulas = [
    { id: 1, nombre: 'Aula Norte', capacidad: 40, tipo: 'AULA', equipamiento: 'Proyector' },
    {
      id: 2,
      nombre: 'Laboratorio Sur',
      capacidad: 25,
      tipo: 'LABORATORIO',
      equipamiento: 'PC, proyector',
    },
    { id: 3, nombre: 'Aula Sur', capacidad: 20, tipo: 'AULA', equipamiento: null },
  ];
  it('combina nombre, tipo, capacidad y equipamiento, sin distinguir tildes', () => {
    const page = TestBed.createComponent(Aulas).componentInstance;
    http.expectOne('/api/aulas').flush(aulas);
    page.query.set('nórte');
    page.tipo.set('AULA');
    page.capacidad.set(30);
    page.equipamiento.set('PROYECTOR');
    expect(page.filtered().map((a) => a.id)).toEqual([1]);
    page.capacidad.set(50);
    expect(page.filtered()).toEqual([]);
    page.clear();
    expect(page.filtered()).toHaveLength(3);
  });
  it('oculta acciones administrativas al alumno', async () => {
    TestBed.inject(AuthService).login('alumno', 'Usuario1').subscribe();
    http.expectOne('/api/usuarios/me').flush({ nombre: 'Alumno', rol: 'ALUMNO' });
    const fixture = TestBed.createComponent(Aulas);
    http.expectOne('/api/aulas').flush(aulas);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Nueva aula');
    expect(fixture.nativeElement.textContent).not.toContain('Eliminar');
  });
  it('rechaza capacidades fraccionarias y nombres en blanco antes del envío', () => {
    const page = TestBed.createComponent(Aulas).componentInstance;
    http.expectOne('/api/aulas').flush([]);
    page.form.patchValue({ nombre: '   ', capacidad: 2.5 });
    page.save();
    expect(page.form.invalid).toBe(true);
    http.expectNone((req) => req.method === 'POST');
  });
});
