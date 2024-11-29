import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostrarPreguntasComponent } from './mostrar-preguntas.component';

describe('MostrarPreguntasComponent', () => {
  let component: MostrarPreguntasComponent;
  let fixture: ComponentFixture<MostrarPreguntasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostrarPreguntasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MostrarPreguntasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
