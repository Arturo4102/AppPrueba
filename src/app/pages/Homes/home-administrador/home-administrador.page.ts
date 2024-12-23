import { Component, OnDestroy, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TeacherI } from '../../../common/models/teacher.models';
import { FormsModule } from '@angular/forms';
import { IoniconsModule } from '../../../common/modules/ionicons.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionService } from 'src/app/common/services/session.service';
import { ArasaacService } from 'src/app/common/services/arasaac.service';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { Subscription } from 'rxjs';

registerLocaleData(localeEs);

@Component({
  selector: 'app-home-administrador',
  templateUrl: './home-administrador.page.html',
  styleUrls: ['./home-administrador.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, IoniconsModule, CommonModule, RouterModule],
  providers: [{ provide: LOCALE_ID, useValue: 'es-ES' }],
})


export class HomeAdministradorPage implements OnDestroy{
  @ViewChild(IonContent, { static: false }) content: IonContent;
 
  administrative: boolean = false; // Nueva propiedad para almacenar el nombre del administrador
  userActual : TeacherI | null = null;
  sessionSubscription: Subscription;
  arasaacService: any;


  constructor(
    private readonly sessionService: SessionService,
    private readonly router: Router,
    arasaacService: ArasaacService
  ) {
    this.arasaacService = arasaacService;
    this.init();
  }
    
  init() {
    //     const user = this.sessionService.getCurrentUser();
    this.sessionSubscription = this.sessionService.getSessionObservable().subscribe(user => {    //Miro que profesor ha iniciado sesión

    if (user && (user as TeacherI).administrative) {
      this.userActual = user as unknown as TeacherI;
      this.administrative = (user as TeacherI).administrative; // Asignar el nombre del administrador
      // this.sessionService.setCurrentUser(this.userActual, 'admin'); // Actualizar el usuario actual en el servicio de sesión
    } else {
      console.error('El usuario actual no es válido o no tiene permisos de administrador.'+ user.name);
      this.router.navigate(['/loginprofesor']); // Redirigir al login de administrador
    }
  });
  }

  
  logout() { 
    this.router.navigate(['/loginprofesor']);
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }
  ngOnDestroy() {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }
  
}