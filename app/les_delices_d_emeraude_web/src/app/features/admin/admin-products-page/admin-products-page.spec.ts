import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductsPage } from './admin-products-page';

describe('AdminProductsPage', () => {
  let component: AdminProductsPage;
  let fixture: ComponentFixture<AdminProductsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
