import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdcutDetailPage } from './prodcut-detail-page';

describe('ProdcutDetailPage', () => {
  let component: ProdcutDetailPage;
  let fixture: ComponentFixture<ProdcutDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdcutDetailPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ProdcutDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
