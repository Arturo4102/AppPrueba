import { DocumentReference, Timestamp } from "firebase/firestore";

export interface TareaI{
    id: string;
    Nombre: string;
    Completada: boolean;
    Fecha?: Timestamp;
    Asignado?: DocumentReference; // Referencia al documento de usuario
}
