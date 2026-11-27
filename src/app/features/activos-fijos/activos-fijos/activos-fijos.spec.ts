import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivosFijos } from './activos-fijos';

describe('ActivosFijos', () => {
  let component: ActivosFijos;
  let fixture: ComponentFixture<ActivosFijos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivosFijos],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivosFijos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
