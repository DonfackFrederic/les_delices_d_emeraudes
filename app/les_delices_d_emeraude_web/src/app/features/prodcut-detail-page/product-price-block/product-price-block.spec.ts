import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPriceBlock } from './product-price-block';

describe('ProductPriceBlock', () => {
  let component: ProductPriceBlock;
  let fixture: ComponentFixture<ProductPriceBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPriceBlock],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPriceBlock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
