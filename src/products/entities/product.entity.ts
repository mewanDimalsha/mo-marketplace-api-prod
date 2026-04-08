import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { Variant } from './variant.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'varchar', nullable: true })
    description: string | null;

    @Column({ type: 'varchar', nullable: true })
    imageUrl: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Variant, (variant) => variant.product, {
        cascade: true,
        eager: true,
    })
    variants: Variant[];
}