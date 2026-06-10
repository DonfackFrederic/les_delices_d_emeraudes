import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductOptions } from './product-options';

describe('ProductOption', () => {
  let component: ProductOptions;
  let fixture: ComponentFixture<ProductOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductOptions],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductOptions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
