import { ComponentFixture, TestBed } from '@angular/core/testing';
import ListStatus from './list-status';

describe('ListStatus', () => {
  let component: ListStatus;
  let fixture: ComponentFixture<ListStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ListStatus] }).compileComponents();
    fixture = TestBed.createComponent(ListStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
