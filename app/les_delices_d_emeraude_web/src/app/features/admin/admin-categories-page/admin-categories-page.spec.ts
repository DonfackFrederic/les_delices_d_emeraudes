import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCategoriesPage } from './admin-categories-page';

describe('AdminCategoriesPage', () => {
  let component: AdminCategoriesPage;
  let fixture: ComponentFixture<AdminCategoriesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCategoriesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCategoriesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
