import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreguntasIncomodasComponent } from './preguntas-incomodas.component';

describe('PreguntasIncomodasComponent', () => {
  let component: PreguntasIncomodasComponent;
  let fixture: ComponentFixture<PreguntasIncomodasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreguntasIncomodasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreguntasIncomodasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
