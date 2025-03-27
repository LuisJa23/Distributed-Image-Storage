import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Bucket } from './bucket';
import { Label } from './label';

/**
 * Entidad Image: representa una imagen con su URL, tamaño y nombre de archivo.
 */
@Entity('image')
export class Image {
    // Identificador único generado automáticamente.
    @PrimaryGeneratedColumn('increment')
    id!: number;

    // URL de la imagen.
    @Column({ type: 'varchar', length: 255 })
    url!: string;

    // Tamaño de la imagen (valor decimal).
    @Column({ type: 'double precision' })
    size!: number;

    // Nombre del archivo de la imagen.
    @Column({ type: 'varchar', length: 255 })
    file_name!: string;

    // Relación: cada imagen pertenece a un bucket; si se elimina el bucket, se eliminan sus imágenes.
    @ManyToOne(() => Bucket, (bucket) => bucket.images, { onDelete: 'CASCADE' })
    bucket!: Bucket;

    // Relación: una imagen puede tener múltiples etiquetas asociadas.
    @OneToMany(() => Label, (label) => label.image)
    labels!: Label[];
}
