export interface MaterialI {
  nombre: string;             // Nombre del material
  cantidad: number;           // Cantidad de material
  color?: string;             // Color (opcional)
  tamano?: string;            // Tamaño (opcional)
  clave: string;              // Clave única generada
  atributos?: {               // Información adicional de atributos
    color?: string[];
    tamano?: string[];        // Tamaño del material
  };
}

// Sobra un color y un tamano, si siempre se van a llamar igual yo dejaría los de fuera del array
// Yo pondría también un pictograma ID para poder obtener la imagen del pictograma, no sé como hacer para que te obtenga el primero relacionado con el nombre

