import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonModal, IonButtons, IonIcon, IonGrid, IonRow, IonCol, IonFooter, IonImg, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Class } from '../../../common/models/class.models';
import { MenuType, Menu } from '../../../common/models/menu.models';
import { StudentI } from 'src/app/common/models/student.models';
import { Timestamp } from 'firebase/firestore';
import { ClassService } from '../../../common/services/class.service';
import { MenuService } from '../../../common/services/menu.service';
import { SessionService } from 'src/app/common/services/session.service';
import { TasksService } from 'src/app/common/services/tasks.service';
import { AnimationService } from 'src/app/common/services/animation.service';
import { Router } from '@angular/router';
import { CelebracionComponent } from "../../../shared/celebracion/celebracion.component";


@Component({
  selector: 'app-task-menus',
  templateUrl: './task-menus.page.html',
  styleUrls: ['./task-menus.page.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonImg, IonFooter, IonCol, IonRow, IonGrid, IonIcon, IonModal, IonCardTitle, IonCardContent, IonCard, IonList, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, CelebracionComponent]
})
export class TaskMenusPage implements OnInit {
  @ViewChild(CelebracionComponent) celebracionComponent!: CelebracionComponent;

  taskId: string = '';
  taskTitle: string = '';
  taskPictogramId: string = '';
  userActual: any = null;

  classes: Class[] = [];
  infoClasses: { [key: string]: { n: number, state: boolean } } = {};
  menuTypes: MenuType[] = [];
  selectedClass: Class | null = null;
  menu: Menu = {
    id: '',
    date: Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0))),
    menus: {}
  };
  menuTypesPerPage: number = 1;
  currentMTPage: number = 0;
  classesPerPage: number = 4;
  currentCPage: number = 0;

  readonly cardsHeight: number = 150;


  constructor(private classService: ClassService,
    private menuService: MenuService,
    private router: Router,
    private sessionService: SessionService,
    private taskService: TasksService,
    private animationService: AnimationService) { }

  ngOnInit() {

    // Comprobar que el usuario actual es un alumno
    const user = this.sessionService.getCurrentUser();
    if (user && 'correctPassword' in user) {
      this.userActual = user as unknown as StudentI;
      console.log('Usuario loggeado:', this.userActual.name);
    } else {
      console.error('El usuario actual no es válido o no es un StudentI.');
      this.router.navigate(['/paginainicial']);
    }


    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.taskId = navigation.extras.state['taskID'];
      this.taskTitle = navigation.extras.state['taskTitle'];
      this.taskPictogramId = navigation.extras.state['PictogramId'];
      console.log('Task ID:', this.taskId);
      console.log('Task Title:', this.taskTitle);
      console.log('Task Pictogram ID:', this.taskPictogramId);
      // this.calculateNumMenuTypesPerPage();
    } else
      console.error('No se ha pasado el ID de la tarea.');

    this.loadStructure();
    this.calculateNumClassesPerPage();

  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.calculateNumClassesPerPage();
    //this.calculateNumMenuTypesPerPage();
  }


  loadStructure() {
    this.classService.getAllClasses().subscribe(classes => {
      this.classes = classes;
      this.menuService.getAllMenuTypes().subscribe(menuTypes => {
        this.menuTypes = menuTypes;
        this.classes.forEach(cls => {
          this.infoClasses[cls.name] = { n: 0, state: false };
          this.menu.menus[cls.name] = {};
          this.menuTypes.forEach(menuType => {
            this.menu.menus[cls.name][menuType.name] = 0;
          });
        });
      });
    });
  }

  calculateNumClassesPerPage() {
    const headerHeight = 100;
    const footerHeight = 100;
    const contentHeight = window.innerHeight - headerHeight - footerHeight - 20;

    console.log('window.innerHeight', window.innerHeight, ' headerHeight', headerHeight, ' footerHeight', footerHeight);

    this.classesPerPage = Math.floor(contentHeight / this.cardsHeight);
  }

  calculateNumMenuTypesPerPage() {
    const headerHeight = 150;
    const footerHeight = 80;
    const contentHeight = window.innerHeight - headerHeight - footerHeight;

    console.log('window.innerHeight', window.innerHeight, ' headerHeight', headerHeight, ' footerHeight', footerHeight);

    this.menuTypesPerPage = Math.floor(contentHeight / this.cardsHeight);
  }

  selectClass(cls: Class) {
    this.selectedClass = cls;
  }

  increment(menuTypeName: string) {
    if (this.selectedClass) {
      let totalMenus = Object.values(this.menu.menus[this.selectedClass.name]).reduce((a, b) => a + b, 0);
      if (totalMenus < this.infoClasses[this.selectedClass.name].n) {
        this.menu.menus[this.selectedClass.name][menuTypeName]++;
        this.updateClassState();
      } else {
        // alert('No hay tantos alumnos.');
      }
    }
  }

  decrement(menuTypeName: string) {
    if (this.selectedClass && this.menu.menus[this.selectedClass.name][menuTypeName] > 0) {
      this.menu.menus[this.selectedClass.name][menuTypeName]--;
      this.updateClassState();
    }
  }

  incrementStudents() {
    if (this.selectClass && this.infoClasses[this.selectedClass.name].n < 30) {
      this.infoClasses[this.selectedClass.name].n++;
      this.updateClassState();
    }
  }

  decrementStudents() {
    if (this.selectedClass) {
      const totalMenus = Object.values(this.menu.menus[this.selectedClass.name]).reduce((a, b) => a + b, 0);
      if (this.infoClasses[this.selectedClass.name].n > totalMenus) {
        this.infoClasses[this.selectedClass.name].n--;
        this.updateClassState();
      } else {
        // alert('No se puede decrementar, hay tantos menús como estudiantes.');
      }
    }
  }

  updateClassState() {
    const totalMenus = Object.values(this.menu.menus[this.selectedClass.name]).reduce((a, b) => a + b, 0);
    this.infoClasses[this.selectedClass.name].state =
      (this.infoClasses[this.selectedClass.name].n != 0
        && totalMenus == this.infoClasses[this.selectedClass.name].n);
  }

  showPendingMenus(cls: Class) {
    if (!this.infoClasses[cls.name].state) {
      let pendingMenus = this.infoClasses[cls.name].n;
      if (pendingMenus == 0) {
        // alert("No hay alumnos en la clase.");
      }
      else {
        this.menuTypes.forEach(menuType => {
          pendingMenus -= this.menu.menus[cls.name][menuType.name];
        });
        // alert(`Quedan por asignar ${pendingMenus} menús a la clase ${cls.name}`);
      }
    }
  }

  getMenuTypesForcurrentPage(): MenuType[] {
    const startIndex = this.currentMTPage * this.menuTypesPerPage;
    return this.menuTypes.slice(startIndex, startIndex + this.menuTypesPerPage);
  }

  nextMTPage() {
    if ((this.currentMTPage + 1) * this.menuTypesPerPage < this.menuTypes.length) {
      this.currentMTPage++;
    }
  }

  previousMTPage() {
    if (this.currentMTPage > 0) {
      this.currentMTPage--;
    }
  }

  getClassesForcurrentPage(): Class[] {
    const startIndex = this.currentCPage * this.classesPerPage;
    return this.classes.slice(startIndex, startIndex + this.classesPerPage);
  }

  nextCPage() {
    if ((this.currentCPage + 1) * this.classesPerPage < this.classes.length) {
      this.currentCPage++;
    }
  }

  previousCPage() {
    if (this.currentCPage > 0) {
      this.currentCPage--;
    }
  }


  allClassesCompleted() {
    return Object.values(this.infoClasses).every(info => info.state);
  }


  getNumPict(num: number): string {
    // return this.arasaacService.getPictogramImageUrl(this.arasaacService.numbersPictograms[num]);
    return `../../../assets/imagenes/numbers/${num}.png`;
  }

  getPictogram(pictogramId: string): string {
    return `https://api.arasaac.org/api/pictograms/${pictogramId}`;
  }

  completeTask() {
    if (this.allClassesCompleted()) {
      this.menuService.createMenu(this.menu).then(() => {
        this.taskService.completeTaskById(this.taskId, this.userActual.id).then(() => {

          this.animationService.activarAnimacion('/tareasdiarioalumno', true);
        });
      });
    } else {
      // alert('No se pueden guardar los menús, hay clases sin completar.');
    }
  }

  salir() {
    this.router.navigate(['/tareasdiarioalumno']);
  }

}