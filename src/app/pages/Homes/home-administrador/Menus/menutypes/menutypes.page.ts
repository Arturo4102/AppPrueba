import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonButton, IonIcon, IonCard, IonCardTitle, IonButtons, IonItem, IonLabel, IonImg , IonThumbnail, IonInput, IonRow, IonGrid, IonCol, IonAlert } from '@ionic/angular/standalone';
import { MenuType } from 'src/app/common/models/menu.models';
import { MenuService } from 'src/app/common/services/menu.service';
import { PictogramSearchComponent } from "../../../../../shared/pictogram-search/pictogram-search.component";
import { ChangeDetectorRef } from '@angular/core';
import { AlertService } from 'src/app/common/services/alert.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/common/services/session.service';
import { TeacherI } from 'src/app/common/models/teacher.models';

@Component({
  selector: 'app-menutypes',
  templateUrl: './menutypes.page.html',
  styleUrls: ['./menutypes.page.scss'],
  standalone: true,
  imports: [IonCol, IonGrid, RouterModule, IonRow, IonInput, IonImg, IonLabel, IonItem, IonButtons, IonCard, IonIcon, IonButton, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, PictogramSearchComponent, IonThumbnail]
})
export class MenuTypesPage implements OnInit {

  menuTypes: MenuType[] = [];
  showMenuTypeForm: boolean = false; 
  
  actualMenuType: MenuType = { id: '', name: '', pictogramId: '' };
  editedMenuType: MenuType | null = null;
  editingMenuType: boolean = false;

  userActual: TeacherI | null = null;

  constructor( private menuService: MenuService,
    private readonly router: Router, 
    private cdr: ChangeDetectorRef,
    private readonly sessionService: SessionService, 
    private alertService: AlertService) { }

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

  async loadStructure(){
    this.menuService.getAllMenuTypes().subscribe( (data) => {
      this.menuTypes = data;
    })
  }

  salir() {
    this.router.navigate(['/homeadministrador']);
  }

  addMenuType() {
    if (this.actualMenuType.name.trim() !== "") { // Verifica que el nombre no esté vacío o solo contenga espacios
      this.menuService.createMenuType(this.actualMenuType).then(() => {
        this.loadStructure();
        this.menuTypeFormFunciton();
      });
    } else {
      this.alertService.showAlert("Alerta","Tiene que rellenar el campo Nombre"); 
    }
  }

  saveMenuType() {
    if (this.actualMenuType.name.trim() !== "") { // Verifica que el nombre no esté vacío o solo contenga espacios
      if (this.actualMenuType.name !== this.editedMenuType?.name || this.actualMenuType.pictogramId !== this.editedMenuType?.pictogramId) { // Comprobamos que haya cambiado
        this.menuService.updateMenuType(this.actualMenuType).then(() => {
          this.loadStructure();
          this.menuTypeFormFunciton();
        });
      } else {
        this.menuTypeFormFunciton();
      }
      this.editedMenuType = null;
    } else {
      this.alertService.showAlert("Alerta","Tiene que rellenar el campo Nombre"); 
    }
  }

  editMenuType(cls: MenuType) {
    this.editedMenuType = cls;
    this.actualMenuType = { ...cls };
    this.editingMenuType = true;
    this.menuTypeFormFunciton();
  }

  deleteMenuType(cls: MenuType) {
    if (this.alertService.showConfirm("Confirmar acción",`Deseas eliminar la clase ${cls.name}?`)) {
      this.menuService.deleteMenuType(cls.id).then(() => {
        this.loadStructure();
      });
    }
  }

  menuTypeFormFunciton() {
    this.showMenuTypeForm = !this.showMenuTypeForm;
    if (!this.showMenuTypeForm) {
      this.actualMenuType = { id: '', name: '', pictogramId: '' };
      this.editingMenuType = false;
    }
  }
}