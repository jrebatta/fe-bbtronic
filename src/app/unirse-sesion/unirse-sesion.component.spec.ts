import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnirseSesionComponent } from './unirse-sesion.component';

describe('UnirseSesionComponent', () => {
  let component: UnirseSesionComponent;
  let fixture: ComponentFixture<UnirseSesionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnirseSesionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnirseSesionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
