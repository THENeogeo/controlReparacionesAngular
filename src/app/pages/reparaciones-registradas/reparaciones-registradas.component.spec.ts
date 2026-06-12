import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparacionesRegistradasComponent } from './reparaciones-registradas.component';

describe('ReparacionesRegistradasComponent', () => {
  let component: ReparacionesRegistradasComponent;
  let fixture: ComponentFixture<ReparacionesRegistradasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparacionesRegistradasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReparacionesRegistradasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
