import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ProfI } from '../../common/models/profesor.models';
import { FirestoreService } from '../../common/services/firestore.service';
import { UserI } from '../../common/models/users.models';
import { FormsModule } from '@angular/forms';
import { IoniconsModule } from '../../common/modules/ionicons.module';
import { CommonModule } from '@angular/common';
import { TareaI } from 'src/app/common/models/tarea.models';
import { doc } from 'firebase/firestore';

@Component({
  selector: 'app-home-administrador',
  templateUrl: './home-administrador.page.html',
  styleUrls: ['./home-administrador.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, IoniconsModule, CommonModule],
})


export class HomeAdministradorPage {
  cargando: boolean = false;
  
  profs: ProfI[] = [];
  newProf: ProfI;
  prof: ProfI;

  students: UserI[] = [];
  newStud: UserI;
  stud: UserI;

  tareas: TareaI[] = [];
  newTarea: TareaI;
  tarea: TareaI;
  selectedStudent: UserI; // Estudiante al que se asignará la tarea

  showForm = false; // Variable para mostrar/ocultar el formulario de tarea


  constructor(private firestoreService: FirestoreService) {
    //Profs
    this.loadprofs();
    this.initProf();
    this.getProf();

    //Students
    this.loadStudents();
    this.initStudent();
    this.getStudent();

     //Tareas
     this.loadTareas();
     this.initTarea();
     this.getTarea();
  }
  
  // Profesor section
async addprof(){
  this.newProf.id = this.firestoreService.createIDDoc();
  await this.firestoreService.createDocumentID(this.newProf, 'Profesores', this.newProf.id);
}

  initProf(){
    this.newProf = {
      Nombre: null,
      Edad: null,
      id: this.firestoreService.createIDDoc(),
      Password:null,
      Administrativo: false
    }
  }

  loadprofs(){
  this.firestoreService.getCollectionChanges<ProfI>('Profesores').subscribe((data) => {
    if (data) {
      this.profs = data;
    }
  });
  }

  async saveProf(){
    this.cargando = true;
    await this.firestoreService.createDocumentID(this.newProf, 'Profesores', this.newProf.id);
    this.cargando = false;
    // this.cleanInterface();
  }
  

  edit(prof: ProfI){
    console.log('edit -> ', prof);
    this.newProf = prof;
  }

  async delete(prof: ProfI){
    this.cargando = true;
    console.log('delete -> ',prof.id);
    await this.firestoreService.deleteDocumentID('Profesores', prof.id);
    this.cargando = false;
  }

  async getProf(){
    const res = await this.firestoreService.getDocument<ProfI>('Profesores/'+ this.newProf.id);
    this.prof = res.data();
  }


  // Students section
  
  async addStud(){
    this.newProf.id = this.firestoreService.createIDDoc();
    await this.firestoreService.createDocumentID(this.newStud, 'Usuarios', this.newStud.id);
  }
  
  initStudent(){
    this.newStud = {
      id: this.firestoreService.createIDDoc(),
      nombre: null,
      edad: null,
      password:null,
      TipoDiscapacidad: null,
    }
  }

  loadStudents(){
  this.firestoreService.getCollectionChanges<UserI>('Usuarios').subscribe((data) => {
    if (data) {
      this.students = data;
    }
  });
  }

  async saveStudent(){
    this.cargando = true;
    await this.firestoreService.createDocumentID(this.newStud, 'Usuarios', this.newStud.id);
    this.cargando = false;
    // this.cleanInterface();
  }

  editStu(student: UserI){
    console.log('edit -> ', student);
    this.newStud = student;
  }

  async deleteStu(student: UserI){
    this.cargando = true;
    console.log('delete -> ', student.id);
    await this.firestoreService.deleteDocumentID('Usuarios', student.id);
    this.cargando = false;
  }

  async getStudent(){
    const res = await this.firestoreService.getDocument<UserI>('Usuarios/'+ this.newStud.id);
    this.stud = res.data();
  }
  
  
  // Tareas section

  initTarea(){
    this.newTarea = {
      id: this.firestoreService.createIDDoc(),
      Nombre: null,
      Completada: null,
      Fecha: null, // Fecha y hora actuales
      Asignado: null,
    }
  }

  loadTareas(){
  this.firestoreService.getCollectionChanges<TareaI>('Tareas').subscribe((data) => {
    if (data) {
      this.tareas = data;
      console.log('tareas -> ', this.tareas);
    }
  });
  }

  async saveTarea() {    
    this.cargando = true;
    if (this.selectedStudent) {
      this.newTarea.Asignado = doc(this.firestoreService.firestore, 'Usuarios', this.selectedStudent.id);
    }
    await this.firestoreService.createDocumentID(this.newTarea, 'Tareas', this.newTarea.id); // Aquí se corrige `this.newStud`
    this.cargando = false;
  }

  async getStudentFromTarea(tarea: TareaI) {
    if (tarea.Asignado) {
      const userPath = tarea.Asignado.path;
      const usuario = await this.firestoreService.getDocument<UserI>(userPath);
      console.log('Usuario asignado:', usuario);
    }
  }

  async deleteTarea(tarea: TareaI){
    this.cargando = true;
    console.log('delete -> ', tarea.id);
    await this.firestoreService.deleteDocumentID('Tareas', tarea.id);
    this.cargando = false;
  }

  async getTarea(){
    const res = await this.firestoreService.getDocument<TareaI>('Tareas/'+ this.newTarea.id);
    this.tarea = res.data();
  }
  
  editTarea(tarea: TareaI){
    console.log('edit -> ', tarea);
    this.newTarea = tarea;  }

  

  async addTarea(){
      this.cargando = true;
      await this.firestoreService.createDocumentID(this.newTarea, 'Tareas', this.newTarea.id);
      this.showForm = false;  // Oculta el formulario después de guardar
      this.cleanInterfaceTarea();
      this.cargando = false;
      // this.cleanInterface();
     }
    
 
     // Método para mostrar y ocultar el formulario de tarea
  toggleForm() {
    console.log('toggleForm activated');
    this.showForm = !this.showForm;
  } 

  cleanInterfaceTarea(){ 
    this.newTarea.Nombre = null;
    this.newTarea.Asignado = null;
    this.newTarea.Completada = null;
    this.newTarea.Fecha = null;
  }

  // ChangePassword() {
  //   this.navCtrl.navigateForward('/change-password');
  // }


}
