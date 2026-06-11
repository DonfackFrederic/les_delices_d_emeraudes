import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OauthCallbackpage } from './oauth-callbackpage';

describe('OauthCallbackpage', () => {
  let component: OauthCallbackpage;
  let fixture: ComponentFixture<OauthCallbackpage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OauthCallbackpage],
    }).compileComponents();

    fixture = TestBed.createComponent(OauthCallbackpage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
