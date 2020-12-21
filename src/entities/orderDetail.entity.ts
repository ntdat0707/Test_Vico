import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity()
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  productVariantId: string;

  @Column('uuid', { nullable: true })
  toppingId: string;

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
    if (object.price || object.price === 0) this.unitPrice = parseInt(object.price);
    if (object.discount || object.discount === 0) this.discount = parseInt(object.discount);
  }
}
