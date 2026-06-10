import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductOptionItem } from './product-option-item';

describe('ProductOptionItem', () => {
  let component: ProductOptionItem;
  let fixture: ComponentFixture<ProductOptionItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductOptionItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductOptionItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
