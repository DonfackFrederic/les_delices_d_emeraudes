import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersListPage } from './orders-list.page';

describe('OrdersListPage', () => {
  let component: OrdersListPage;
  let fixture: ComponentFixture<OrdersListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersListPage],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
