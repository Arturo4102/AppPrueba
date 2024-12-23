import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonLabel, IonDatetime, IonSegmentButton, IonSegment, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonRow, IonGrid, IonCol } from '@ionic/angular/standalone';
import { MenuService } from 'src/app/common/services/menu.service';
import { Menu } from 'src/app/common/models/menu.models';
import { ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { TeacherI } from 'src/app/common/models/teacher.models';
import { SessionService } from 'src/app/common/services/session.service';


@Component({
  selector: 'app-show-menus',
  templateUrl: './show-menus.page.html',
  styleUrls: ['./show-menus.page.scss'],
  standalone: true,
  imports: [IonCol, IonGrid, RouterModule, IonRow, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonSegment, IonSegmentButton, IonLabel, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonDatetime, CommonModule, FormsModule]
})
export class ShowMenusPage implements OnInit {

  menus: Menu[] = [];
  menuMap: Map<string, Menu> = new Map<string, Menu>();
  actualDate: string = this.convertDate(new Date);
  showingDate: string = this.convertDate(new Date);
  showMenu: Menu | undefined = undefined;
  classNames: string[] = [];
  menuTypeNames: string[] = [];
  totalMenuTypes: Map<string, number> = new Map<string, number>();
  viewMode: string = "classView";
  printMode: boolean = false;

  userActual: TeacherI | null = null;


  constructor(private menuService: MenuService,
    private readonly router: Router,
    private readonly sessionService: SessionService,
    private cdr: ChangeDetectorRef) { }

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

  convertMenuToString(): string {
    if (!this.showMenu) {
      return '';
    } else {
      let menuString = `showingDate: ${this.showingDate}\n` +
        `showMenu: \n` + `\tdate: ${this.showMenu.date.toDate().toISOString()}\n`;

      this.classNames.forEach(className => {
        menuString += `\t${className}\n`;
        this.menuTypeNames.forEach(menuTypeName => {
          menuString += `\t\t${menuTypeName}: ${this.showMenu.menus[className][menuTypeName]}\n`;
        });
      });
      return menuString;
    }
  }

  loadStructure() {
    this.menuService.getAllMenus().subscribe((menus) => {
      this.menus = menus;
      this.menus.forEach((menu) => {
        this.menuMap.set(this.convertDate(menu.date.toDate()), menu);
      });
    });
  }

  loadMenuForDate() {
    this.viewMode = "";
    this.showMenu = this.menuMap.get(this.showingDate);
    if (this.showMenu !== undefined) {
      this.classNames = Object.keys(this.showMenu.menus);
      this.menuTypeNames = Object.keys(this.showMenu.menus[this.classNames[0]]);
      this.totalMenuTypes.clear();
      this.menuTypeNames.forEach(menuTypeName => {
        this.totalMenuTypes.set(menuTypeName, 0);
      });
      this.classNames.forEach(className => {
        this.menuTypeNames.forEach(menuTypeName => {
          const count = this.showMenu.menus[className][menuTypeName];
          this.totalMenuTypes.set(menuTypeName, this.totalMenuTypes.get(menuTypeName) + count);
        });
      });
    }
  }

  convertDate(date: Date): string {
    return new Date(date.getTime() + 60 * 60 * 1000).toISOString().split('T')[0];
  }

  imprimir() {
    if (this.showMenu !== undefined) {
      this.printMode = true;
      this.viewMode = "menuView";
      this.cdr.detectChanges(); // Force change detection
      setTimeout(() => {
        window.print();
        this.printMode = false;
        this.cdr.detectChanges(); // Force change detection
      }, 1000);
    } else {
      alert('No hay menú para la fecha seleccionada');
    }
  }

  salir() {
    this.router.navigate(['/homeadministrador']);
  }
}