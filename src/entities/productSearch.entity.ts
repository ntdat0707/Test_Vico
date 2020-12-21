import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Entity } from "typeorm";

@Entity()
export class ProductSearch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    productId:string;

    @Column('varchar', { nullable: true })
    searchValue: string;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
    updatedAt: Date;
  
    @Column({ type: 'timestamptz', nullable: true, select: false })
    deletedAt: Date;
}