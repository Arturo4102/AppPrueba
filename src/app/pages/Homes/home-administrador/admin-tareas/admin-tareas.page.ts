import { Component, ViewChild, SecurityContext } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TeacherI } from 'src/app/common/models/teacher.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { StudentI } from 'src/app/common/models/student.models';
import { getDoc, setDoc } from 'firebase/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DescriptionI, TaskI, StepI } from 'src/app/common/models/task.models';
import { doc, Timestamp } from 'firebase/firestore';
import { RouterModule } from '@angular/router';
import { SessionService } from 'src/app/common/services/session.service';
import { Router } from '@angular/router';
import { TeacherService } from 'src/app/common/services/teacher.service';
import { StudentService } from 'src/app/common/services/student.service';
import { TasksService } from 'src/app/common/services/tasks.service';
import { PictogramSearchComponent } from 'src/app/shared/pictogram-search/pictogram-search.component';
import { AlertController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

registerLocaleData(localeEs);

@Component({
  selector: 'app-admin-administrador',
  templateUrl: './admin-tareas.page.html',
  styleUrls: ['./admin-tareas.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule, PictogramSearchComponent],
  providers: [{ provide: LOCALE_ID, useValue: 'es-ES' }],
})


export class AdminTareasPage{
  //Esto lo uso para cuando edito tarea, que scrollee hasta arriba del todo
  @ViewChild(IonContent, { static: false }) content: IonContent;

  //Profesores
  teachers: TeacherI[] = [];
  newTeacher: TeacherI;
  teacher: TeacherI;

  userActual: TeacherI;

  //Alumnos
  students: StudentI[] = [];
  newStud: StudentI;
  stud: StudentI;

  selectedStudents: any[] = []; // Estudiante al que se asignará la tarea

  //Tareas
  tasks: TaskI[] = [];
  newTarea: TaskI;
  tareaVacia: TaskI;
  tarea: TaskI;
  selectedTask: TaskI | null = null; // Tarea seleccionada en el formulario
  currentStudentIndex: number = 0;     // Índice del alumno actual en la lista
  editedTask: TaskI | null = null;   // Tarea seleccionada para editar
  originalAssigned: { assignedId: string, assignedName: string }[] = [];

  tasksWithAssignment: any[] = [];
  tasksWithoutAssignment: any[] = [];

  tempFechaInicio: any = null;
  tempFechaCumplimiento: any = null;
  minFecha: string;
  minEndFecha: string;
  newImageLink: string = '';

  //Descripciones
  tasksDescriptions: DescriptionI[] = [];
  newTaskDescription: DescriptionI;
  description: DescriptionI;

  //Paso de tarea
  newStep: StepI;
  newStepDescription: string;
  newStepImageLink: string;
  newStepVideoLink: string;
  sanitizer: DomSanitizer;
  
  //Formularios
  showTaskForm: boolean = false;
  showAssignationsForm: boolean = false;
  showStudentForm: boolean = false;
  showTeacherForm: boolean = false; 
  assignationStep: number = 1;   //Comprueba si estoy en el paso 1, de añadir tarea, siendo el paso 2 asignar tarea

  //Pop up de las fechas de MenuTask
  // Configuración del toast
  toastConfig = {
    isOpen: false,
    message: '',
    color: 'danger', // Rojo para errores
    duration: 3000, // Duración en milisegundos
  };

  //Subject
  private unsubscribe$ = new Subject<void>();

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly sessionService: SessionService,
    private readonly router: Router,
    private readonly teacherService: TeacherService,
    private readonly studentService: StudentService,
    private readonly taskService: TasksService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {
    
    this.load();
    this.init();
   
    //Profs
    //Students
    this.getStudent();
     //Tareas
     this.getTarea();

  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
 
  init(){

    //Miro que admin ha iniciado sesion
    const user = this.sessionService.getCurrentUser();

    // Inicializa los objetos de profesor, estudiante, tarea y descripcion de la tarea
    this.newTeacher = this.teacherService.initTeacher();

    this.newStud = this.studentService.initStudent();
    
    this.newTaskDescription = this.taskService.initTaskDescription();

    this.newTarea = this.taskService.initTask();  

    this.tareaVacia = this.taskService.initTask();

    this.newStep = this.taskService.initStep();

    this.newStepDescription = ''
    this.newStepImageLink = ''
  }

  // Método para cargar los datos de la base de datos
  load(){
    // Descripciones de tareas
    this.firestoreService.getCollectionChanges<DescriptionI>('Description')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        if (data) {
          this.tasksDescriptions = data;
        }
      });

      this.firestoreService.getCollectionChanges<TaskI>('Tasks')
  .pipe(takeUntil(this.unsubscribe$))
  .subscribe(async (data) => {
    if (data) {
      // Declaramos las variables con tipo explícito
      const tasksWithAssignment: TaskI[] = [];
      const tasksWithoutAssignment: TaskI[] = [];

      await Promise.all(data.map(async (task) => {
        try {
          const descriptionDocRef = doc(this.firestoreService.firestore, 'Description', task.associatedDescriptionId);
          const descriptionDoc = await getDoc(descriptionDocRef);

          if (descriptionDoc.exists()) {
            task['descriptionData'] = descriptionDoc.data() as DescriptionI;
          }
        } catch (error) {
          console.error(`Error fetching description for task ${task.associatedDescriptionId}:`, error);
        }

        if (task.assigned && task.assigned.length > 0) {
          tasksWithAssignment.push(task);
        } else {
          tasksWithoutAssignment.push(task);
        }
      }));

      // Actualizamos las listas con los resultados procesados
      this.tasksWithAssignment = tasksWithAssignment;
      this.tasksWithoutAssignment = tasksWithoutAssignment;

      console.log('Tareas con asignación: ', this.tasksWithAssignment);
      console.log('Tareas sin asignación: ', this.tasksWithoutAssignment);
    }
  });

    // Estudiantes
    this.firestoreService.getCollectionChanges<StudentI>('Students')
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((data) => {
      if (data) {
        this.students = data;
        console.log('Estudiantes -> ', this.students);
      }
    });

    // Profesores
    this.firestoreService.getCollectionChanges<TeacherI>('Teachers')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        if (data) {
          this.teachers = data;
          console.log('Profesores -> ', this.teachers);
        }
      });
  }

  // GETTERS
  // Método para obtener un profesor de la base de datos

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
    const res = await this.firestoreService.getDocument<TaskI>('Tasks/'+ this.newTarea.taskID);
    this.tarea = res.data();
  }

  // Método para obtener una descripcion de la base de datos
  async getDescripcion(){
    const res = await this.firestoreService.getDocument<DescriptionI>('Description/'+ this.newTaskDescription.descriptionId);
    this.description = res.data();
  }

  //EN PRINCIPIO ESTA FUNCION NO SE USA EN NINGUN LADO
  // Método para obtener un estudiante de una tarea
  /*async getStudentsFromTarea(tarea: TaskI) {
    if (tarea.assigned && tarea.assigned.length > 0) {
      for (const studentName of tarea.assigned) {
        // Aquí 'studentName' es el nombre completo (ej. "Laura Pérez")
        try {
          // Compara el nombre completo con el usuario logueado
          if (studentName === this.userActual.name) {
            // Si coincide, obtén los datos del estudiante desde Firestore
            const studentData = await this.firestoreService.getStudentByName(studentName);
            console.log('Estudiante asignado:', studentData);
          }
        } catch (error) {
          console.error('Error al obtener los datos del estudiante:', error);
        }
      }
    } else {
      console.log('No hay estudiantes asignados a esta tarea.');
    }
  }*/

  //~~~~~~~~~~~~~~~~~~~~~~~~~Tarea section~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Método para añadir una nueva tarea a la base de datos (tarea no existente en la BD)
  async addTarea(){
    this.newTarea.taskID = this.firestoreService.createIDDoc();
    this.newTarea.assigned = [];
    this.newTaskDescription.descriptionId = this.firestoreService.createIDDoc();

    //Creo la descripcion en la bd
    await this.firestoreService.createDocumentID(this.newTaskDescription, 'Description', this.newTaskDescription.descriptionId);

    //Asocio esa descripcion a la tarea
    this.newTarea.associatedDescriptionId = this.newTaskDescription.descriptionId;
    
    //Creo la tarea en la bd
    await this.firestoreService.createDocumentID(this.newTarea, 'Tasks', this.newTarea.taskID);

    this.showTaskForm = false;
    this.cleanInterfaceTarea();
  }

  // Función que se llama cuando se selecciona una tarea
  onTaskSelect(task: TaskI) {
    if (task) {
      this.selectedTask = task;
      this.currentStudentIndex = 0; // Volver al primer alumno cada vez que se selecciona una tarea
  
      // Asegurar que todos los objetos en `assigned` tienen la estructura correcta
      this.selectedTask.assigned = this.selectedTask.assigned.map(a => ({
        assignedId: a.assignedId,
        assignedName: a.assignedName,
        completed: a.completed || false,
        doneTime: a.doneTime || null,
        startTime: a.startTime || null,
        endTime: a.endTime || null,
      }));
  
      console.log('Tarea seleccionada:', this.selectedTask);
    }
  }

  onTaskAssignmentChange(event: any): void {
    if (this.selectedTask?.type === 'RequestTask') {
      const selectedStudent = event?.detail?.value;
  
      // Si no se ha seleccionado nada, desmarcar cualquier selección
      if (!selectedStudent || selectedStudent === null) {
        this.selectedTask.assigned = []; // Desmarcar
      } else if (this.selectedTask.assigned && this.selectedTask.assigned[0]?.assignedId === selectedStudent?.assignedId) {
        // Si el alumno ya está asignado, desmarcarlo
        this.selectedTask.assigned = []; // Desmarcar
      } else {
        // Si el alumno no estaba asignado, asignarlo
        this.selectedTask.assigned = [selectedStudent]; // Asignar el alumno seleccionado
      }
      console.log('ALUMNO: ', this.selectedTask.assigned);
    }
  }
    
  validateDatesForMenuTask(assignedStudent: any): void {
    if (this.selectedTask?.type === 'MenuTask' || this.selectedTask?.type === 'RequestTask') {
      // Verificar que startTime y endTime sean del mismo día
      if (assignedStudent.startTime && assignedStudent.endTime) {
        const startDate = new Date(assignedStudent.startTime);
        const endDate = new Date(assignedStudent.endTime);
  
        if (startDate.toDateString() !== endDate.toDateString()) {
          // Resetear endTime si no es del mismo día
          assignedStudent.endTime = null;
          this.showToast('La fecha de cumplimiento debe ser el mismo día que la de inicio.');
          return;
        }
      }
  
      // Verificar que no se repita el día entre alumnos
      const selectedDate = new Date(assignedStudent.startTime).toDateString();
      const isDateRepeated = this.selectedTask.assigned.some(
        (student: any) =>
          student !== assignedStudent &&
          new Date(student.startTime).toDateString() === selectedDate
      );
  
      if (isDateRepeated) {
        assignedStudent.startTime = null;
        assignedStudent.endTime = null;
        this.showToast('Este día ya está asignado a otro alumno. Por favor, selecciona otro.');
      }
    }
  }    

  // Mostrar el toast con un mensaje
  showToast(message: string, color: string = 'danger'): void {
    this.toastConfig = {
      isOpen: true,
      message,
      color,
      duration: 3000,
    };
  }

  // Cerrar el toast manualmente si es necesario
  closeToast(): void {
    this.toastConfig.isOpen = false;
  }

  // Función para pasar al siguiente alumno
  nextStudent() {
    if (this.currentStudentIndex < this.selectedTask.assigned.length - 1) {
      this.currentStudentIndex++;
    }
    // Reseteamos las fechas cuando avanzamos al siguiente alumno
    this.resetFechaInicio();
    this.resetFechaCumplimiento();
  }  

  // Función para volver al alumno anterior
  previousStudent() {
    if (this.currentStudentIndex > 0) {
      this.currentStudentIndex--;
    }
    // Reseteamos las fechas cuando retrocedemos al alumno anterior
    this.resetFechaInicio();
    this.resetFechaCumplimiento();
  }

  getAssignedObject(student: any): TaskI["assigned"][0] {
    // Asegurarse de que assigned sea un array
    const assigned = Array.isArray(this.selectedTask?.assigned) ? this.selectedTask.assigned : [];
  
    // Verificamos si el alumno ya está asignado
    const existingAssignment = assigned.find(a => a.assignedId === student.id);
    
    // Si ya está asignado, lo devolvemos
    if (existingAssignment) {
      return existingAssignment;
    }
  
    // Si no está asignado, devolvemos un objeto con los valores por defecto
    return {
      assignedId: student.id,
      assignedName: `${student.name} ${student.surname}`,
      completed: false,
      doneTime: null, // Tipo Timestamp | null
      startTime: null, // Tipo Timestamp | null
      endTime: null,   // Tipo Timestamp | null
    };
  }  

  async updateTaskInDatabase() {
    try {
      const taskRef = this.firestoreService.getDocumentReference('Tasks', this.selectedTask.taskID);
      console.log('Actualizando tarea con asignados:', this.selectedTask.assigned);
      await this.firestoreService.updateDocument(taskRef, {
        assigned: this.selectedTask.assigned,  // Actualizamos la lista de alumnos asignados
      });
      console.log('Tarea actualizada exitosamente:', this.selectedTask);
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
    }
  }

  goToPreviousStep() {
    if (this.assignationStep > 1) {
      this.assignationStep--; // Retroceder al paso anterior
    }

    // Reiniciar el índice del alumno al primero si volvemos al paso 1
    if (this.assignationStep === 1) {
      this.currentStudentIndex = 0;
    }
  }  

  async assignTarea() {
    if (this.selectedTask) {
      if (this.assignationStep === 1) {
        this.actualizarMinFecha();
        // Paso 1: Actualizar los alumnos seleccionados
        const removedStudents = this.originalAssigned.filter(student =>
          !this.selectedTask.assigned.some(current => current.assignedId === student.assignedId)
        );
  
        const addedStudents = this.selectedTask.assigned.filter(student =>
          !this.originalAssigned.some(original => original.assignedId === student.assignedId)
        );
  
        // Eliminar alumnos desmarcados
        removedStudents.forEach(student => {
          const index = this.selectedTask.assigned.findIndex(a => a.assignedId === student.assignedId);
          if (index >= 0) {
            this.selectedTask.assigned.splice(index, 1);
          }
        });
  
        // Agregar alumnos nuevos a la lista
        addedStudents.forEach(student => {
          // Verificar si el alumno ya está en la lista de asignados para evitar duplicados
          const existingStudent = this.selectedTask.assigned.find(a => a.assignedId === student.assignedId);
          if (!existingStudent) {
            // Completar el objeto del alumno con las propiedades necesarias
            this.selectedTask.assigned.push();
          }
        });
  
        console.log('Alumnos actualizados:', this.selectedTask.assigned);
  
        // Asegurarse de que los cambios se guarden correctamente en la base de datos
        //await this.updateTaskInDatabase();
  
        // Cambiar a paso 2 para mostrar las fechas de inicio y fin
        this.assignationStep = 2;
        return;
      }
  
      if (this.assignationStep === 2) {
        // Aquí se guardan las fechas de inicio y fin de cada alumno
        await this.updateTaskInDatabase();
        this.selectedTask = null;
        this.assignationStep = 1;
        this.toggleAssignationForm();
        this.cdr.detectChanges();
      }
    }
  }  
  
  trackByTaskId(index: number, task: TaskI): string {
    return task.taskID;
  }

  // Método para limpiar la interfaz de nueva tarea
  cleanInterfaceTarea(){ 
    this.newTarea.title = null;
    this.newTarea.type = null;
    this.newTarea.assigned = this.newTarea.assigned.map(student => ({
      ...student,
      assignedName: null as string | null,
      assignedId: null as string | null,
      completed: false,
      startTime: null as Timestamp | null,
      endTime: null as Timestamp | null,
      doneTime: null as Timestamp | null
    }));
  
    this.newTaskDescription.text = null;
    this.newTaskDescription.link = null;
    this.newTaskDescription.pictogramId = null;
  }

 // Método para eliminar una tarea de la base de datos
 async deleteTarea(tarea: TaskI) {
  const alert = await this.alertController.create({
    header: 'Confirmar eliminación',
    message: `¿Estás seguro de que deseas eliminar la tarea "${tarea.title}"?`,
    buttons: [
      {
        text: 'No',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Eliminación cancelada');
        }
      },
      {
        text: 'Sí',
        handler: async () => {
          try {
            console.log('delete -> ', tarea.taskID);

            // Eliminar la tarea
            await this.firestoreService.deleteDocumentID('Tasks', tarea.taskID);

            // Eliminar la descripción asociada
            if (tarea.associatedDescriptionId) {
              console.log('Eliminando la descripción asociada con ID: ', tarea.associatedDescriptionId);
              await this.firestoreService.deleteDocumentID('Description', tarea.associatedDescriptionId);
            }

            console.log(`Tarea "${tarea.title}" eliminada correctamente`);
          } catch (error) {
            console.error('Error al eliminar la tarea o la descripción:', error);
          }
        }
      }
    ]
  });

  await alert.present();
}

  // Función para cargar la tarea seleccionada en el formulario de edición
  editTarea(tarea: TaskI) {
    console.log('edit -> ', tarea);
    this.editedTask = tarea;
  
    // Copia superficial de los valores
    this.newTarea = { ...tarea };
  
    // Cargar la descripción asociada
    if (tarea.associatedDescriptionId) {
      const descriptionDocRef = doc(this.firestoreService.firestore, 'Description', tarea.associatedDescriptionId);
      getDoc(descriptionDocRef).then(descriptionDoc => {
        if (descriptionDoc.exists()) {
          this.newTaskDescription = descriptionDoc.data() as DescriptionI;
        }
      });
    }

    // Mover la vista al principio de la página
    this.content.scrollToTop();  // Esto mueve la página al inicio
  
    this.showTaskForm = true; // Mostrar el formulario
  }  

  async saveTarea() {
    if (this.editedTask) {
      try {
        // Actualizar la descripción si es necesario
        if (this.newTaskDescription.descriptionId) {
          // Crear un objeto con los campos relevantes de la descripción
          let descripcion = {
            descriptionId: this.newTaskDescription.descriptionId,
            imagesId: this.newTaskDescription.imagesId,
            text: this.newTaskDescription.text,
            pictogramId: this.newTaskDescription.pictogramId,
            link: this.newTaskDescription.link,
            steps: this.newTaskDescription.steps
          };

          if (this.newTaskDescription.steps == undefined) {
            descripcion.steps = null
          }

          console.log(descripcion)

          const descriptionRef = doc(this.firestoreService.firestore, 'Description', this.editedTask.associatedDescriptionId);
          await setDoc(descriptionRef, descripcion);  // Solo actualizamos los campos necesarios de la descripción
          console.log('Descripción actualizada correctamente');
        }

        // Preparar los datos de los alumnos asignados
        const updatedAssigned = this.newTarea.assigned.map((assigned) => {
          return {
            assignedName: assigned.assignedName,
            assignedId: assigned.assignedId,
            completed: assigned.completed || false,
            startTime: assigned.startTime || null, // Si ya es Timestamp, se usa directamente
            endTime: assigned.endTime || null,     
            doneTime: assigned.doneTime || null,
          };
        });
        

        // Validar y actualizar fechas si existen
        const updatedTask: Partial<TaskI> = {
          assigned: updatedAssigned,
          associatedDescriptionId: this.editedTask.associatedDescriptionId,
          descriptionData: this.tareaVacia.descriptionData,
          taskID: this.newTarea.taskID,
          title: this.newTarea.title,
          type: this.newTarea.type,
        };

        // Actualizar la tarea en Firestore
        const taskRef = doc(this.firestoreService.firestore, 'Tasks', this.editedTask.taskID);
        await setDoc(taskRef, updatedTask); // Actualizamos la tarea principal

        console.log('Tarea actualizada correctamente');
        this.toggleTaskForm(); // Cerrar el formulario después de la edición

        // Vaciar la tarea editada después de guardarla
        this.editedTask = null;
        this.newTarea = this.taskService.initTask();
        this.newTaskDescription = this.taskService.initTaskDescription();
        this.resetFechaInicio();
        this.resetFechaCumplimiento();

      } catch (error) {
        console.error('Error al actualizar la tarea:', error);
      }
    }
  }

  actualizarMinFecha() {
    const fechaActual = new Date();
    
    // Ajustamos para asegurar que la hora y fecha sean correctas en la zona horaria local
    const offsetMs = fechaActual.getTimezoneOffset() * 60000; // Desfase horario en milisegundos
    const fechaLocal = new Date(fechaActual.getTime() - offsetMs); // Convertimos a hora local
  
    // Establecemos la hora de la fecha local como la hora mínima (sin segundos ni milisegundos)
    fechaLocal.setSeconds(0, 0); // Aseguramos que los segundos y milisegundos no interfieran
  
    this.minFecha = fechaLocal.toISOString(); // Formateamos como ISO
  }

  actualizarMinEndFecha(startFecha: string | Timestamp | null) {
    if (startFecha) {
      let fechaInicio: Date;
  
      // Verificamos si startFecha es un Timestamp (Firebase)
      if (startFecha instanceof Date) {
        fechaInicio = startFecha;
      } else if (typeof startFecha === 'object' && 'seconds' in startFecha && 'nanoseconds' in startFecha) {
        // Es un Timestamp de Firebase
        fechaInicio = new Date(startFecha.seconds * 1000); // Convertimos segundos a milisegundos
      } else if (typeof startFecha === 'string') {
        // Es un string ya en formato ISO
        fechaInicio = new Date(startFecha);
      } else {
        console.error('Formato no reconocido para startFecha:', startFecha);
        return;
      }
  
      // Ajustamos a la zona horaria local
      const offsetMs = fechaInicio.getTimezoneOffset() * 60000; // Desfase horario en milisegundos
      const fechaLocal = new Date(fechaInicio.getTime() - offsetMs);
  
      // Aseguramos que los segundos y milisegundos no interfieran
      fechaLocal.setSeconds(0, 0);
  
      // Actualizamos la variable global `minEndFecha` en formato ISO
      this.minEndFecha = fechaLocal.toISOString();
    } else {
      // Si no hay una fecha de inicio válida, reiniciamos `minEndFecha` a un valor nulo o predeterminado
      this.minEndFecha = this.minFecha; // Por defecto, la fecha actual mínima
    }
  }
  
  convertTimestampToDate(timestamp: any): Date | null {
    // Verifica si es una cadena de texto y conviértelo a un objeto Date
    if (timestamp && typeof timestamp === 'string') {
      return new Date(timestamp);  // Convierte el string de fecha a un objeto Date
    }
    return null;
  }
  
  //Resets
  resetFechaInicio() {
    this.tempFechaInicio = null;
  }
  
  resetFechaCumplimiento() {
    this.tempFechaCumplimiento = null;
  }

  resetFechaInicioAlumno() {
    const assignedStudent = this.selectedTask.assigned[this.currentStudentIndex];
    this.tempFechaInicio = null;
    if (assignedStudent) {
      assignedStudent.startTime = null;
      console.log('Fecha de inicio reiniciada:', assignedStudent);
    }
  }
  
  resetFechaCumplimientoAlumno() {
    const assignedStudent = this.selectedTask.assigned[this.currentStudentIndex];
    this.tempFechaCumplimiento = null;
    if (assignedStudent) {
      assignedStudent.endTime = null;
      console.log('Fecha límite reiniciada:', assignedStudent);
    }
  }

  resetSelectedStudents() {
    this.selectedStudents = []; // Limpia la lista de alumnos seleccionados
  }
  
  // Métodos para mostrar y ocultar el formulario de tarea, alumnos y profesores
  toggleTaskForm() {
    console.log('toggleTaskForm activated');
    this.showTaskForm = !this.showTaskForm;

    // Vaciar la tarea editada si se cancela el formulario
    if (!this.showTaskForm) {
      this.editedTask = null;
      this.newTarea = this.taskService.initTask();
      this.newTaskDescription = this.taskService.initTaskDescription();
    }
  } 

  // Métodos para mostrar y ocultar el formulario de tarea, alumnos y profesores
  toggleAssignationForm() {
    console.log('toggleAssignationForm activated');
    this.showAssignationsForm = !this.showAssignationsForm;
    this.selectedTask = null; 
    if(this.assignationStep == 2)
      this.assignationStep = 1;
  }
  
  addImage() {
    if (this.newImageLink.trim() !== '') {
      if (!this.newTaskDescription.imagesId) {
        this.newTaskDescription.imagesId = [];
      }
      this.newTaskDescription.imagesId.push(this.newImageLink.trim());
      this.newImageLink = ''; // Limpiar el campo de entrada después de añadir la imagen
    }
  }
  
  removeImage(imageId: string) {
    if (this.newTaskDescription.imagesId) {
      const index = this.newTaskDescription.imagesId.indexOf(imageId);
      if (index > -1) {
        this.newTaskDescription.imagesId.splice(index, 1);
      }
    }
  }

  // Añadir paso
  addStep() {
    if ( (this.newStepImageLink != undefined && this.newStepImageLink.trim() !== '')
      || (this.newStepVideoLink != undefined && this.newStepVideoLink.trim() !== '')
      || this.newStep.pictogramId != null) 
      {
      if (!this.newTaskDescription.steps) {
        this.newTaskDescription.steps = [];
      }

      // Configuramos nuevo paso
      if (this.newStepDescription == undefined || this.newStepDescription.trim() == '') this.newStep.text = "Descripción del paso"
      else this.newStep.text = this.newStepDescription.trim()
      
      if (this.newStepImageLink != undefined && this.newStepImageLink.trim() !== '') this.newStep.imageUrl = this.newStepImageLink.trim()

      if (this.newStepVideoLink != undefined && this.newStepVideoLink.trim() !== '') this.newStep.videoUrl = this.newStepVideoLink.trim()
      // console.log(this.newStepVideoLink.trim())
        // this.newStep.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.newStepVideoLink.trim()) as string;

      // Añadimos nuevo paso
      this.newTaskDescription.steps.push(this.newStep)

      console.log(this.newTaskDescription.steps)

      // Limipiamos campos
      this.newStep = this.taskService.initStep();
      this.newStepDescription = ''
      this.newStepImageLink = ''
      this.newStepVideoLink = ''
    }
  }

  removeStep(step: StepI) {
    if (this.newTaskDescription.steps) {
      const index = this.newTaskDescription.steps.indexOf(step);
      if (index > -1) {
        this.newTaskDescription.steps.splice(index, 1);
      }
    }
  }

  comeback(){
    this.router.navigate(['/homeadministrador']);
  }
}