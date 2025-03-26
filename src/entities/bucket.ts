import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Image } from './image';

@Entity('bucket')
export class Bucket {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'double precision' }) // Compatible con PostgreSQL y MySQL
    storage!: number;

    @OneToMany(() => Image, (image) => image.bucket)
    images!: Image[];
}
