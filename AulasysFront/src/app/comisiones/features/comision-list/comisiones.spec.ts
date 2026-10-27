import { ComponentFixture, TestBed } from '@angular/core/testing';
import Comisiones from './comisiones';

describe('Comisiones', () => {
  let component: Comisiones;
  let fixture: ComponentFixture<Comisiones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Comisiones] }).compileComponents();
    fixture = TestBed.createComponent(Comisiones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
