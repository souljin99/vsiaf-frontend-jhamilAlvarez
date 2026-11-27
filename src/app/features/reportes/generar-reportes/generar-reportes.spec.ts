import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenerarReportes } from './generar-reportes';

describe('GenerarReportes', () => {
  let component: GenerarReportes;
  let fixture: ComponentFixture<GenerarReportes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarReportes],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerarReportes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
