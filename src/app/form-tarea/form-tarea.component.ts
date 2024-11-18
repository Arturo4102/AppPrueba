import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-form-tarea',
  templateUrl: './form-tarea.component.html',
  styleUrls: ['./form-tarea.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class FormularioTareaComponent {
  @Input() estudiantes: any[] = [];
  tarea: any = { Nombre: '', Completada: false, Fecha: new Date().toISOString(), Asignado: null };

  constructor(private modalCtrl: ModalController) {}

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  guardarTarea() {
    this.modalCtrl.dismiss(this.tarea); // Devuelve la tarea al llamador
  }

  resetFecha() {
    this.tarea.Fecha = new Date().toISOString();
  }
}
