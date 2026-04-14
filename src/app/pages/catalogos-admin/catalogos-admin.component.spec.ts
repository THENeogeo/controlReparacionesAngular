import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogosAdminComponent } from './catalogos-admin.component';

describe('CatalogosAdminComponent', () => {
  let component: CatalogosAdminComponent;
  let fixture: ComponentFixture<CatalogosAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogosAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogosAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
