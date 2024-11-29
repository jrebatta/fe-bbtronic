import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SesionMenuComponent } from './sesion-menu.component';

describe('SesionMenuComponent', () => {
  let component: SesionMenuComponent;
  let fixture: ComponentFixture<SesionMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SesionMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SesionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
