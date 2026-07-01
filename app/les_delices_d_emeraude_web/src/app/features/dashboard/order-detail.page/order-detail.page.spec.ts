import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetailPage } from './order-detail.page';

describe('OrderDetailPage', () => {
  let component: OrderDetailPage;
  let fixture: ComponentFixture<OrderDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetailPage],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
