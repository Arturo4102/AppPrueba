import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc,doc,updateDoc } from '@angular/fire/firestore';

// Definición de la interfaz para los datos del inventario
interface InventoryItem {
  nombre: string;
  tamano: string;
  color: string;
  cantidad: number; // Esta propiedad debe ser de tipo number
}

@Injectable({
  providedIn: 'root',
})
export class RequestsService {
  constructor(private firestore: Firestore) {}

  // Verificar si el material existe en el inventario
  async checkMaterialExists(nombre: string, tamano: string, color: string): Promise<boolean> {
    const inventoryCollection = collection(this.firestore, 'Inventory');
    const q = query(
      inventoryCollection,
      where('nombre', '==', nombre),
      where('tamano', '==', tamano),
      where('color', '==', color)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Devuelve true si hay resultados
  }
  // En tu servicio RequestsService

async getAvailableColors(nombre: string): Promise<string[]> {
  const inventoryCollection = collection(this.firestore, 'Inventory');
  const q = query(inventoryCollection, where('nombre', '==', nombre));

  const querySnapshot = await getDocs(q);
  const colors: string[] = [];

  querySnapshot.forEach((doc) => {
    const material = doc.data() as InventoryItem;
    if (material.color && !colors.includes(material.color)) {
      colors.push(material.color);
    }
  });

  return colors;
}
// Recupera los tamaños disponibles para un material
async getAvailableTamanos(nombre: string): Promise<string[]> {
  const inventoryCollection = collection(this.firestore, 'Inventory');
  const q = query(inventoryCollection, where('nombre', '==', nombre));

  const querySnapshot = await getDocs(q);
  const tamanos: string[] = [];

  querySnapshot.forEach((doc) => {
    const material = doc.data() as InventoryItem;
    if (material.tamano && !tamanos.includes(material.tamano)) {
      tamanos.push(material.tamano);
    }
  });

  return tamanos;
}

// Obtener los colores disponibles para un tamaño específico
async getAvailableColorsForTamano(nombre: string, tamano: string): Promise<string[]> {
  const inventoryCollection = collection(this.firestore, 'Inventory');
  const q = query(inventoryCollection, where('nombre', '==', nombre), where('tamano', '==', tamano));

  const querySnapshot = await getDocs(q);
  const colors: string[] = [];

  querySnapshot.forEach((doc) => {
    const material = doc.data() as InventoryItem;
    if (material.color && !colors.includes(material.color)) {
      colors.push(material.color);
    }
  });

  return colors;
}

// Obtener los tamaños disponibles para un color específico
async getAvailableTamanosForColor(nombre: string, color: string): Promise<string[]> {
  const inventoryCollection = collection(this.firestore, 'Inventory');
  const q = query(inventoryCollection, where('nombre', '==', nombre), where('color', '==', color));

  const querySnapshot = await getDocs(q);
  const tamanos: string[] = [];

  querySnapshot.forEach((doc) => {
    const material = doc.data() as InventoryItem;
    if (material.tamano && !tamanos.includes(material.tamano)) {
      tamanos.push(material.tamano);
    }
  });

  return tamanos;
}




  // Verificar si el material tiene suficiente cantidad en el inventario
  async checkMaterialQuantity(
    nombre: string,
    tamano: string,
    color: string,
    cantidadSolicitada: number
  ): Promise<boolean> {
    const inventoryCollection = collection(this.firestore, 'Inventory');
    const q = query(
      inventoryCollection,
      where('nombre', '==', nombre),
      where('tamano', '==', tamano),
      where('color', '==', color)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return false; // El material no existe
    }

    const doc = querySnapshot.docs[0];
    const inventoryData = doc.data() as InventoryItem;  // Asegúrate de que inventoryData sea de tipo InventoryItem
    return inventoryData.cantidad >= cantidadSolicitada; // Verifica si hay suficiente cantidad
  }
  async updateMaterialQuantity(nombre: string, tamano: string, color: string, cantidadSolicitada: number): Promise<void> {
    const inventoryCollection = collection(this.firestore, 'Inventory');
    const q = query(
      inventoryCollection,
      where('nombre', '==', nombre),
      where('tamano', '==', tamano),
      where('color', '==', color)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]; // Obtén el primer documento
      const inventoryRef = doc.ref; // Referencia al documento

      const inventoryData = doc.data();
      const nuevaCantidad = inventoryData['cantidad'] - cantidadSolicitada;


      if (nuevaCantidad < 0) {
        throw new Error('Cantidad insuficiente para actualizar.');
      }

      // Actualiza la cantidad en Firestore
      await updateDoc(inventoryRef, {
        cantidad: nuevaCantidad,
      });

      console.log(`Cantidad de ${nombre} ${tamano} ${color} actualizada a ${nuevaCantidad}`);
    } else {
      throw new Error(`El material "${nombre}" no se encuentra en el inventario.`);
    }
  }

  // Función para enviar datos a Firestore
  async sendRequest(requestData: any): Promise<void> {
    try {
      const docRef = await addDoc(collection(this.firestore, 'Requests'), requestData);
      console.log('Solicitud enviada con ID:', docRef.id);
    } catch (error) {
      console.error('Error al enviar la solicitud: ', error);
      throw new Error('No se pudo enviar la solicitud');
    }
  }

  // Función para normalizar cadenas de texto
  normalizeText(input: string): string {
    if (!input || input.trim() === '') return 'NoEspecificado';
    return input.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }
}
