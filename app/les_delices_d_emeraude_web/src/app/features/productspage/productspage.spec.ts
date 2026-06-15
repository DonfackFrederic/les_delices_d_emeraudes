import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Productspage } from './productspage';

describe('Productpage', () => {
  let component: Productspage;
  let fixture: ComponentFixture<Productspage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Productspage],
    }).compileComponents();

    fixture = TestBed.createComponent(Productspage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
