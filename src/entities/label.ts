import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Image } from './image';

/**
 * Entidad Label: representa una etiqueta asociada a una imagen.
 */
@Entity('label')
export class Label {
    // Identificador único generado automáticamente.
    @PrimaryGeneratedColumn('increment')
    id!: number;

    // Nombre de la etiqueta.
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    // Nivel de confianza de la etiqueta (valor decimal).
    @Column({ type: 'double precision' })
    confidence!: number;

    // Relación: cada etiqueta pertenece a una imagen. Si se elimina la imagen, se eliminan sus etiquetas.
    @ManyToOne(() => Image, (image) => image.labels, { onDelete: 'CASCADE' })
    image!: Image;
}
