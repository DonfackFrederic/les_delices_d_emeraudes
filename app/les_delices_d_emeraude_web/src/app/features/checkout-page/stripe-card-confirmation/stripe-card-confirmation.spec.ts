import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeCardConfirmation } from './stripe-card-confirmation';

describe('StripeCardConfirmation', () => {
  let component: StripeCardConfirmation;
  let fixture: ComponentFixture<StripeCardConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StripeCardConfirmation],
    }).compileComponents();

    fixture = TestBed.createComponent(StripeCardConfirmation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
