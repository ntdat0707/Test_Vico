import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity()
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productVariantId: string;

  @Column('integer')
  quantity: number;

  @Column('integer')
  unitPrice: number;

  @Column('uuid')
  orderId: string;

  @Column('integer', { default: 0 })
  discount: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  setAttributes(object: any) {
    if (object.id !== undefined) this.productVariantId = object.id;
    if (object.quantity || object.quantity === 0) this.quantity = parseInt(object.quantity);
    if (object.totalPrice || object.totalPrice === 0) this.unitPrice = parseInt(object.totalPrice);
    if (object.discount || object.discount === 0) this.discount = parseInt(object.discount);
  }
}
