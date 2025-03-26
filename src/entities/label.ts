import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Image } from './image';

@Entity('label')
export class Label {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'double precision' }) // Compatible con PostgreSQL y MySQL
    confidence!: number;

    @ManyToOne(() => Image, (image) => image.labels, { onDelete: 'CASCADE' })
    image!: Image;
}
