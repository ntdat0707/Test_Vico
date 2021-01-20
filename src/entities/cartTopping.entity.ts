import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity()
export class CartTopping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  cartId: string;

  @Column('uuid')
  toppingId: string;

  @Column('integer')
  quantity: number;

  @Column('integer', { nullable: true })
  sugar: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  setAttributes(object: any) {
    if (object.id) this.toppingId = object.id;
    if (object.quantity || object.quantity === 0) this.quantity = parseInt(object.quantity);
  }
}
