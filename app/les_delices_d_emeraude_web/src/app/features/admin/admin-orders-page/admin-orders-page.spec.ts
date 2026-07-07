import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOrdersPage } from './admin-orders-page';

describe('AdminOrdersPage', () => {
  let component: AdminOrdersPage;
  let fixture: ComponentFixture<AdminOrdersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrdersPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOrdersPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
