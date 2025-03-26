import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('image') // Nombre de la tabla
export class Image {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    url!: string;

    @Column({ type: 'varchar', length: 255 })
    filename!: string;

    @Column({ type: 'int' })
    size!: number;
}