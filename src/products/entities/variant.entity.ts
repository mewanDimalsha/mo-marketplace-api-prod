import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('variants')
export class Variant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    color: string;

    @Column()
    size: string;

    @Column()
    material: string;

    @Column({ unique: true })
    combination_key: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({ default: 0 })
    stock: number;

    @ManyToOne(() => Product, (product) => product.variants, {
        onDelete: 'CASCADE',
    })
    product: Product;

    @CreateDateColumn()
    createdAt: Date;
}