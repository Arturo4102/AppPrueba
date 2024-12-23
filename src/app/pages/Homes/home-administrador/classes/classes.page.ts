import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonButton, IonIcon, IonCard, IonCardTitle, IonButtons, IonItem, IonLabel, IonImg, IonThumbnail, IonInput, IonRow, IonGrid, IonCol, IonAlert } from '@ionic/angular/standalone';
import { Class } from 'src/app/common/models/class.models';
import { ClassService } from 'src/app/common/services/class.service';
import { PictogramSearchComponent } from "src/app/shared/pictogram-search/pictogram-search.component";
import { ChangeDetectorRef } from '@angular/core';
import { AlertService } from 'src/app/common/services/alert.service';
import { ArasaacService } from 'src/app/common/services/arasaac.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionService } from 'src/app/common/services/session.service';
import { TeacherI } from 'src/app/common/models/teacher.models';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.page.html',
  styleUrls: ['./classes.page.scss'],
  standalone: true,
  imports: [IonCol, IonGrid, IonRow, IonInput, RouterModule, IonImg, IonLabel, IonItem, IonButtons, IonCard, IonIcon, IonButton, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, PictogramSearchComponent, IonThumbnail]
})
export class ClassesPage implements OnInit {

  classes: Class[] = [];
  showClassForm: boolean = false;
  actualClass: Class = { id: '', name: '', pictogramId: '' };
  editedClass: Class | null = null;
  editingClass: boolean = false;

  userActual: TeacherI | null = null;
  arasaacService: ArasaacService;


  constructor(
    private classService: ClassService,
    private cdr: ChangeDetectorRef,
    private readonly router: Router,
    private alertService: AlertService,
    private readonly sessionService: SessionService,
    private arasaac: ArasaacService) {
    this.arasaacService = arasaac;
  }

  ngOnInit() {

    // Comprobar que el usuario actual es un administrador
    const user = this.sessionService.getCurrentUser();
    if (user && (user as TeacherI).administrative) {
      this.userActual = user as unknown as TeacherI;
      console.log('Usuario loggeado:', this.userActual.name);
    } else {
      console.error('El usuario actual no es válido o no tiene permisos de administrador.');
      this.router.navigate(['/loginprofesor']); // Redirigir al login de administrador
    }

    this.loadStructure();
  }

  async loadStructure() {
    this.classService.getAllClasses().subscribe((data) => {
      this.classes = data;
    })
  }

  salir() {
    this.router.navigate(['/homeadministrador']);
  }

  addClass() {
    if (this.actualClass.name.trim() !== "") { // Verifica que el nombre no esté vacío o solo contenga espacios
      this.classService.createClass(this.actualClass).then(() => {
        this.loadStructure();
        this.classFormFunciton();
      });
    } else {
      this.alertService.showAlert("Alerta", "Tiene que rellenar el campo Nombre");
    }
  }

  saveClass() {
    if (this.actualClass.name.trim() !== "") { // Verifica que el nombre no esté vacío o solo contenga espacios
      if (this.actualClass.name !== this.editedClass?.name || this.actualClass.pictogramId !== this.editedClass?.pictogramId) { // Comprobamos que haya cambiado
        this.classService.updateClass(this.actualClass).then(() => {
          this.loadStructure();
          this.classFormFunciton();
        });
      } else {
        this.classFormFunciton();
      }
      this.editedClass = null;
    } else {
      this.alertService.showAlert("Alerta", "Tiene que rellenar el campo Nombre");
    }
  }

  editClass(cls: Class) {
    this.editedClass = cls;
    this.actualClass = { ...cls };
    this.editingClass = true;
    this.classFormFunciton();
  }

  deleteClass(cls: Class) {
    if (this.alertService.showConfirm("Confirmar acción", `Deseas eliminar la clase ${cls.name}?`)) {
      this.classService.deleteClass(cls.id).then(() => {
        this.loadStructure();
      });
    }
  }

  classFormFunciton() {
    this.showClassForm = !this.showClassForm;
    if (!this.showClassForm) {
      this.actualClass = { id: '', name: '', pictogramId: '' };
      this.editingClass = false;
    }
  }
}