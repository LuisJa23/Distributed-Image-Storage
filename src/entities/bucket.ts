import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Image } from './image';

/**
 * Entidad Bucket: representa un contenedor de almacenamiento que agrupa imágenes.
 */
@Entity('bucket')
export class Bucket {
    // Identificador único generado automáticamente.
    @PrimaryGeneratedColumn('increment')
    id!: number;

    // Nombre del bucket (máximo 255 caracteres).
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    // Capacidad de almacenamiento del bucket (valor decimal).
    @Column({ type: 'double precision' })
    storage!: number;

    // Relación uno a muchos: un bucket puede tener varias imágenes.
    @OneToMany(() => Image, (image) => image.bucket)
    images!: Image[];
}
