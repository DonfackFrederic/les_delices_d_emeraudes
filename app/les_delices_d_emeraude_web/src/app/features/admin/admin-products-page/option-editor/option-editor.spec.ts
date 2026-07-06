import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionEditor } from './option-editor';

describe('OptionEditor', () => {
  let component: OptionEditor;
  let fixture: ComponentFixture<OptionEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
