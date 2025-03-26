import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Bucket } from './bucket';
import { Label } from './label';

@Entity('image')
export class Image {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    url!: string;

    @Column({ type: 'double precision' }) // Compatible con PostgreSQL y MySQL
    size!: number;

    @Column({ type: 'varchar', length: 255 })
    file_name!: string;

    @ManyToOne(() => Bucket, (bucket) => bucket.images, { onDelete: 'CASCADE' })
    bucket!: Bucket;

    @OneToMany(() => Label, (label) => label.image)
    labels!: Label[];
}
