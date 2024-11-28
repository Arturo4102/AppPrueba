import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TeacherI } from '../../common/models/teacher.models';
import { FirestoreService } from '../../common/services/firestore.service';
import { StudentI } from '../../common/models/student.models';
import { FormsModule } from '@angular/forms';
import { IoniconsModule } from '../../common/modules/ionicons.module';
import { CommonModule } from '@angular/common';
import { TareaI } from 'src/app/common/models/tarea.models';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { RouterModule } from '@angular/router';
import { SessionService } from 'src/app/common/services/session.service';
import { Router } from '@angular/router';
import { TeacherService } from 'src/app/common/services/teacher.service';
import { StudentService } from 'src/app/common/services/student.service';
import { PictogramSearchComponent } from 'src/app/shared/pictogram-search/pictogram-search.component';

@Component({
  selector: 'app-home-administrador',
  templateUrl: './home-administrador.page.html',
  styleUrls: ['./home-administrador.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, IoniconsModule, CommonModule, RouterModule, PictogramSearchComponent],
})


export class HomeAdministradorPage{

  tempFecha: string | null = null;
  
  teachers: TeacherI[] = [];
  newTeacher: TeacherI;
  teacher: TeacherI;

  students: StudentI[] = [];
  newStud: StudentI;
  stud: StudentI;

  tasks: TareaI[] = [];
  newTarea: TareaI;
  tarea: TareaI;
  selectedStudent: StudentI; // Estudiante al que se asignará la tarea

  userActual: TeacherI;

  showTaskForm: boolean = false;
  showStudentForm: boolean = false;
  showTeacherForm: boolean = false; 


  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly sessionService: SessionService,
    private readonly router: Router,
    private readonly teacherService: TeacherService,
    private readonly studentService: StudentService,
  ) {
    
    this.load();
    this.init();
   
    //Profs
    this.getTeacher();
    //Students
    this.getStudent();
     //Tareas
     this.getTarea();

  }
 
  init(){

    //Miro que admin ha iniciado sesion
    const user = this.sessionService.getCurrentUser();
    
    // MODO SÓLO DE PRUEBA ID DE PAULA (ADMIN)
    // const profId = "e1873ba9-8853-44c4-8fd3-4469d7cadb91";
    // const user =  await this.firestoreService.getDocument<TeacherI>(`Teachers/${profId}`)

    if (user as TeacherI && (user as TeacherI).administrative) {
      this.userActual = user as unknown as TeacherI;
      console.log('Administrador loggeado:', this.userActual.name);
    } else {
      console.error('El usuario actual no es válido o no tiene permisos de administrador. ->' , user);
      this.router.navigate(['/loginprofesor']); // Redirigir al login de administrador
      return; // Detenemos la ejecución si el usuario no es válido
    }

    // Inicializa los objetos de profesor, estudiante y tarea
    this.newTeacher = this.teacherService.initTeacher();

    this.newStud = this.studentService.initStudent();
    
    this.newTarea = { 
      id: this.firestoreService.createIDDoc(),
      Nombre: null,
      Completada: null,
      Fecha: null,
      Asignado: null,
      Tipo: null,
      enlace: null,
    }
  }

  // Método para cargar los datos de la base de datos
  load(){
    // Carga los profesores de la base de datos
    // this.teacherService.loadTeachers().then((teachers) => {
    //   this.teachers = teachers;
    // });

    // Carga las tasks de la base de datos
    this.firestoreService.getCollectionChanges<TareaI>('Tasks').subscribe((data) => {
      if (data) {
        this.tasks = data;
        console.log('tasks -> ', this.tasks);
      }
    });

    // Carga los estudiantes de la base de datos
    // this.studentService.loadStudents().then((students) => {
    //   this.students = students;
    // });
    this.firestoreService.getCollectionChanges<StudentI>('Students').subscribe((data) => {
      if (data) {
        this.students = data;
        console.log('Estudiantes -> ', this.students);
      }
    });
    
    this.firestoreService.getCollectionChanges<TeacherI>('Teachers').subscribe((data) => {
      if (data) {
        this.teachers = data;
        console.log('Profesores -> ', this.teachers);
      }
    });
  }

  // GETTERS
  // Método para obtener un profesor de la base de datos
  getTeacher(){
    // const res = await this.firestoreService.getDocument<TeacherI>('Teachers/'+ this.newTeacher.id);
    // this.teacher = res.data();
    this.teacherService.getTeacher(this.newTeacher.id).then((teacher) => {
      this.teacher = teacher;
    });
    console.log('Profesor:', this.teacher);
  }

  // Método para obtener un estudiante de la base de datos
   getStudent(){
  //   const res = await this.firestoreService.getDocument<StudentI>('Students/'+ this.newStud.id);
  //   this.stud = res.data();
  this.studentService.getStudent(this.newStud.id).then((student) => {
    this.stud = student;
  });
  console.log('Estudiante:', this.stud);  
}

  // Método para obtener una tarea de la base de datos
  async getTarea(){
    const res = await this.firestoreService.getDocument<TareaI>('Tareas/'+ this.newTarea.id);
    this.tarea = res.data();
  }

  // Método para obtener un estudiante de una tarea
  async getStudentFromTarea(tarea: TareaI) {
    if (tarea.Asignado) {
      const userPath = tarea.Asignado.path;
      const usuario = await this.firestoreService.getDocument<StudentI>(userPath);
      console.log('Usuario asignado:', usuario);
    }
  }

  
    
  //~~~~~~~~~~~~~~~~~~~~~~~~~Profesor section~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Método para añadir un nuevo profesor a la base de datos (profesor no existente en la BD)
  // async addTeacher(){
  //   this.newTeacher.id = this.firestoreService.createIDDoc();
  //   await this.firestoreService.createDocumentID(this.newTeacher, 'Teachers', this.newTeacher.id);
  //   console.log("Nuevo profesor ->", this.newTeacher);
  //   alert("Profesor añadido con éxito!");
  //   this.showTeacherForm = false;  // Oculta el formulario después de guardar
  // }
  
  // // Método para guardar nuevos datos de un profesor (ya existente) en la base de datos
  // async saveTeacher(){
  //   await this.firestoreService.createDocumentID(this.newTeacher, 'Teachers', this.newTeacher.id);
  // }


  // Método para añadir o actualizar un profesor según el DNI
  addTeacher() {

    // this.newTeacher.id = this.firestoreService.createIDDoc();

    // await this.firestoreService.createDocumentID(this.newTeacher, 'Teachers', this.newTeacher.id);
    this.teacherService.addTeacher(this.newTeacher);
    
    this.showTeacherForm = false;
    // Limpiar el formulario y ocultar
    this.teacherService.cleanTeacherInterface(this.newTeacher);
  }
  
    // // Método para guardar nuevos datos de un profesor (ya existente) en la base de datos
    // async saveTeacher() {
    //   this.teacherService.editTeacher(this.newTeacher);
    // }
    
 // Método para editar un profesor
   editTeacher(teacher: TeacherI){
    // console.log('edit -> ', teacher);
    this.teacherService.editTeacher(teacher);
    this.newTeacher = teacher;
  }

  // Método para eliminar un profesor de la base de datos
  deleteTeacher(teacher: TeacherI){
  //   console.log('delete -> ',teacher.id);
  //   await this.firestoreService.deleteDocumentID('Teachers', teacher.id);
    this.teacherService.deleteTeacher(teacher.id);
    console.log('delete teacher -> ',teacher.name, teacher.surname);

  }

  toggleTeacherForm() {
    this.showTeacherForm = !this.showTeacherForm;
  }



  //~~~~~~~~~~~~~~~~~~~~~~~~~Student section~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Método para añadir un nuevo estudiante a la base de datos (estudiante no existente en la BD)
  addStud(){
    // Hacer comprobación para que al menos estén rellenos los campos obligatorios
    // this.newStud.id = this.firestoreService.createIDDoc();
    // await this.firestoreService.createDocumentID(this.newStud, 'Students', this.newStud.id);
    // this.showStudentForm = false;  // Oculta el formulario después de guardar
    // this.cleanInterfaceStud();
    this.studentService.addStudent(this.newStud);
    
    this.showStudentForm = false;
    // Limpiar el formulario y ocultar
    this.studentService.cleanStudentInterface(this.newStud);
 
  }
      
  // Método para guardar nuevos datos de un estudiante (ya existente) en la base de datos
  async saveStudent(){
    await this.firestoreService.createDocumentID(this.newStud, 'Students', this.newStud.id);
  }

  // Método para editar un estudiante
  editStu(student: StudentI){
    this.studentService.editStudent(student);
    this.newStud = student;
  }

  // Método para eliminar un estudiante de la base de datos
   deleteStu(student: StudentI){
    this.studentService.deleteStudent(student.id);
    console.log('delete student -> ',student.name, student.surname);
  }

toggleStudentForm() {
  console.log('toggleStudentForm activated');
  this.showStudentForm = !this.showStudentForm;
}
  
  
  //~~~~~~~~~~~~~~~~~~~~~~~~~Tarea section~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Método para añadir una nueva tarea a la base de datos (tarea no existente en la BD)
  async addTarea(){
    this.newTarea.id = this.firestoreService.createIDDoc();
    await this.firestoreService.createDocumentID(this.newTarea, 'Tareas', this.newTarea.id);
    this.showTaskForm = false;  // Oculta el formulario después de guardar
    this.cleanInterfaceTarea();
   }

   // Método para limpiar la interfaz de nueva tarea
   cleanInterfaceTarea(){ 
    this.newTarea.Nombre = this.newTarea.Asignado = 
    this.newTarea.Completada = this.newTarea.Fecha = null;
  }
  
  // Método para guardar nuevos datos de una tarea (ya existente) en la base de datos
  async saveTarea() {    
  
    //Si se ha seleccionado un estudiante, se asigna la tarea a ese estudiante
    if (this.selectedStudent) {
      this.newTarea.Asignado = doc(this.firestoreService.firestore, 'Students', this.selectedStudent.id);
    }
    // Guardamos la tarea (con o sin el estudiante) en la base de datos
    await this.firestoreService.createDocumentID(this.newTarea, 'Tareas', this.newTarea.id); 
  }

  cleanInterfaceTask(){ 
    for (const key in this.newTarea) {
      if (this.newTarea.hasOwnProperty(key)) {
        (this.newTarea as any)[key] = null;
      }
    }
  }

 // Método para eliminar una tarea de la base de datos
  async deleteTarea(tarea: TareaI){
    console.log('delete -> ', tarea.id);
    await this.firestoreService.deleteDocumentID('Tareas', tarea.id);
  }

  // Método para editar una tarea
  editTarea(tarea: TareaI){
    console.log('edit -> ', tarea);
    this.newTarea = tarea;  
  }
  
  confirmarFecha() {
    if (this.tempFecha) {
      this.newTarea.Fecha = Timestamp.fromDate(new Date(this.tempFecha)); // Asigna la fecha confirmada al modelo
      console.log('Fecha confirmada:', this.newTarea.Fecha);
    }
  }
 
  // Métodos para mostrar y ocultar el formulario de tarea, alumnos y profesores
  toggleTaskForm() {
    console.log('toggleTaskForm activated');
    this.showTaskForm = !this.showTaskForm;
  } 



  // ChangePassword() {
  //   this.navCtrl.navigateForward('/change-password');
  // }


}


