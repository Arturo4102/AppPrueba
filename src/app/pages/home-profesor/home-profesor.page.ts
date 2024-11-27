import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonList , IonItem, IonCard, IonInput, IonButton, IonSpinner, IonIcon, IonButtons, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { TeacherI } from '../../common/models/teacher.models';
import { FirestoreService } from '../../common/services/firestore.service';
import { StudentI } from '../../common/models/student.models';

import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IoniconsModule } from '../../common/modules/ionicons.module';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/common/services/session.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home-profesor.page.html',
  styleUrls: ['home-profesor.page.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid, IonButtons, IonIcon, IonSpinner, IonButton, IonInput, IonCard, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonLabel, IonItem, FormsModule, IonButton, IonSpinner, IoniconsModule, CommonModule,RouterModule
  ],
})
export class HomePage {
  profs: TeacherI[] = [];
  newTeacher: TeacherI;
  prof: TeacherI;
  cargando: boolean = false;
  students: StudentI[] = [];
  newStud: StudentI;
  stud: StudentI;

  userActual: TeacherI;

  constructor(
    private firestoreService: FirestoreService,
    private navCtrl: NavController,
    private sessionService: SessionService,
    private router: Router
  ) {
    this.load();
    //Profs
    this.loadprofs();
    this.initProf();
    this.getProf();

    //Students
    this.loadStudent();
    this.initStudent();
    this.getStudent();
  }

  load(){
    //Miro que profesor ha iniciado sesion
    const user = this.sessionService.getCurrentUser();

    if (user && 'administrative' in user) {
      this.userActual = user as TeacherI;
      console.log('Profesor loggeado:', this.userActual.name);
    } else {
      console.error('El usuario actual no es válido.');
      this.router.navigate(['/loginprofesor']); // Redirigir al login de administrador
      return; // Detenemos la ejecución si el usuario no es válido
    }
  }
  
  // Profesor section
async addprof(){
  this.newTeacher.id = this.firestoreService.createIDDoc();
  await this.firestoreService.createDocumentID(this.newTeacher, 'Profesores', this.newTeacher.id);
}

  initProf(){
    this.newTeacher = {
      name: null,
      surname: null,
      dni:null,
      id: this.firestoreService.createIDDoc(),
      password: null,
      administrative: false,
      pictogramId: null,
      email: null
    }
  }

  loadprofs(){
  this.firestoreService.getCollectionChanges<TeacherI>('Profesores').subscribe((data) => {
    if (data) {
      this.profs = data;
    }
  });
  }

  async saveProf(){
    this.cargando = true;
    await this.firestoreService.createDocumentID(this.newTeacher, 'Profesores', this.newTeacher.id);
    this.cargando = false;
    this.cleanInterface();
  }
  
  cleanInterface(){ 
    // this.newTeacher.Nombre = null;
    // this.newTeacher.Edad = null;
    // this.newTeacher.Password = null;
    // this.newTeacher.Administrativo = null;
  }


  edit(prof: TeacherI){
    console.log('edit -> ', prof);
    this.newTeacher = prof;
  }

  async delete(prof: TeacherI){
    this.cargando = true;
    console.log('delete -> ',prof.id);
    await this.firestoreService.deleteDocumentID('Profesores', prof.id);
    this.cargando = false;
  }

  async getProf(){
    const res = await this.firestoreService.getDocument<TeacherI>('Profesores/'+ this.newTeacher.id);
    this.prof = res.data();
  }


  // Students section
  
  async addStud(){
    this.newTeacher.id = this.firestoreService.createIDDoc();
    await this.firestoreService.createDocumentID(this.newStud, 'Students', this.newStud.id);
  }
  
  initStudent(){
    this.newStud = {
      id: this.firestoreService.createIDDoc(),
      name: null,
      surname: null,
      dni:null,
      pictogramId: null,
      phone: null,
      personalData: null,
      birthDate: null,
      disabilities: {
        visual: false,
        auditory: false,
        motor: false,
        cognitive: false,
      },
      correctPassword:null,
      loginType: false,
//      id_pictogram: null,
  //    correctPassword: null,
    }
  }

  loadStudent(){
  this.firestoreService.getCollectionChanges<StudentI>('Students').subscribe((data) => {
    if (data) {
      this.students = data;
    }
  });
  }

  async saveStudent(){
    this.cargando = true;
    await this.firestoreService.createDocumentID(this.newStud, 'Students', this.newStud.id);
    this.cargando = false;
    this.cleanInterface();
  }
  
  // cleanInterface(){ 
  //   this.newTeacher.Nombre = null;
  //   this.newTeacher.Edad = null;
  //   this.newTeacher.Password = null;
  //   this.newTeacher.Administrativo = null;
  // }


  editStu(student: StudentI){
    console.log('edit -> ', student);
    this.newStud = student;
  }

  async deleteStu(student: StudentI){
    this.cargando = true;
    console.log('delete -> ', student.id);
    await this.firestoreService.deleteDocumentID('Students', student.id);
    this.cargando = false;
  }

  async getStudent(){
    const res = await this.firestoreService.getDocument<StudentI>('Students/'+ this.newStud.id);
    this.stud = res.data();
  }
  
  


  ChangePassword() {
    this.navCtrl.navigateForward('/change-password');
  }


}