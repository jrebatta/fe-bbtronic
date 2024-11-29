import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuJuegoComponent } from './menu-juego.component';

describe('MenuJuegoComponent', () => {
  let component: MenuJuegoComponent;
  let fixture: ComponentFixture<MenuJuegoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuJuegoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuJuegoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
