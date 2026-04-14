import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogUsuariosComponent } from './log-usuarios.component';

describe('LogUsuariosComponent', () => {
  let component: LogUsuariosComponent;
  let fixture: ComponentFixture<LogUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
