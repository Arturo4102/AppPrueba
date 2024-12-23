import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonList, IonItem, IonLabel, IonInput, IonCard, IonButton, IonThumbnail, IonImg } from '@ionic/angular/standalone';
import { ArasaacService } from '../../common/services/arasaac.service';

@Component({
  selector: 'app-pictogram-search',
  templateUrl: './pictogram-search.component.html',
  styleUrls: ['./pictogram-search.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonCard, IonInput, IonList, IonItem, IonLabel, FormsModule, IonThumbnail, IonImg], 
})

export class PictogramSearchComponent {
  keyword: string = '';
  pictograms: any[] = [];
  cargando: boolean = false;
  @Output() pictogramSelect: EventEmitter<any> = new EventEmitter();
  selectedPictogram: any = null;
  showPictogramList: boolean = true;

  constructor(private arasaacService: ArasaacService) {}

  async searchPictograms() {
    this.cargando = true;
    try {
      const data = await this.arasaacService.getPictograms(this.keyword);
      this.pictograms = data.slice(0, 5);
      this.showPictogramList = true;
    } catch (error) {
      console.error('Error al buscar pictogramas:', error);
    } finally {
      this.cargando = false;
    }
  }

  getPictogramImageUrl(pictogram: any): string {
    return this.arasaacService.getPictogramImageUrl(pictogram._id);
  }

  selectPictogram(pictogram: any) {
    this.selectedPictogram = pictogram;
    console.log('Pictograma seleccionado:', pictogram._id);
    this.pictogramSelect.emit(pictogram._id);
    this.showPictogramList = false;
    this.keyword = ''
  }

}
