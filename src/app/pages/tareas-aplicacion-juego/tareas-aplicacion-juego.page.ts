import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/common/services/session.service';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';
import { StudentI } from 'src/app/common/models/student.models';
import { TareaI } from 'src/app/common/models/tarea.models';

@Component({
  selector: 'app-tareas-aplicacion-juego',
  templateUrl: './tareas-aplicacion-juego.page.html',
  styleUrls: ['./tareas-aplicacion-juego.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, CommonModule, FormsModule]
})
export class TareasAplicacionJuegoPage implements OnInit {
  tareaCompletada: boolean = false;
  mostrarConfeti: boolean = false;
  userActual: StudentI;
  tarea: TareaI;
  enlaceVisitado = false;

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private firestoreService: FirestoreService
  ) { }

  ngOnInit() {

    // Obtener los datos de la tarea pasada como parámetro
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['tarea']) {
      this.tarea = navigation.extras.state['tarea'];
      console.log('Tarea seleccionada:', this.tarea);
    }

    const user = this.sessionService.getCurrentUser();
  
    if (user && 'password' in user) {
      this.userActual = user as unknown as StudentI;
      console.log('Usuario loggeado:', this.userActual.name);
    } else {
      console.error('El usuario actual no es válido o no es un StudentI.');
      this.router.navigate(['/loginalumno']);
    }
  }
  
  // Función para volver al listado de tareas
  volverListado() {
    this.router.navigate(['/tareasdiarioalumno']); // Aquí va la ruta a la página del listado
  }

  // Función para marcar la tarea como completada
  completarTarea() {
    this.tareaCompletada = true;
    this.tarea.Completada = true;

    // Mostrar confeti 1.7s después de que empiece la animación del texto
    setTimeout(() => {
      this.mostrarConfeti = true;
    }, 1600);  // 1700 ms = 1.7 segundos

    // Actualiza la tarea en el servicio de Firestore
    this.firestoreService.actualizarTarea(this.tarea).then(() => {
      console.log('Tarea actualizada a completada:', this.tarea);
      // Emitimos la tarea actualizada para que otros componentes la reciban
    }).catch(error => {
      console.error('Error actualizando tarea:', error);
    });

    // Después de la animación, redirige al listado
    setTimeout(() => {
      this.volverListado(); // Redirige al listado de tareas
    }, 6000); // Espera para volver al listado de tareas
  }

  marcarEnlaceVisitado(){
    this.enlaceVisitado = true;
  }
}