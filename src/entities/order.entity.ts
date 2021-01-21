import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  orderCode: string;

  @Column('uuid')
  customerId: string;

  @Column('varchar')
  source: string;

  @Column('uuid', { nullable: true })
  shippingId: string;

  @Column('integer')
  orderAmount: number;

  @Column('integer')
  orderQuantity: number;

  @Column('integer')
  shippingAmount: number;

  @Column('integer', { default: 0 })
  status: number;

  @Column('text', { nullable: true })
  note: string;

  @Column('integer', { default: 0 })
  totalDiscount: number;

  @Column('varchar')
  paymentType: string;

  @Column('boolean', { default: false })
  isPaid: boolean;

  @Column('timestamptz', { nullable: true })
  shippingTime: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  setAttributes(object: any) {
    if (object.orderCode) this.orderCode = object.orderCode;
    if (object.customerId) this.customerId = object.customerId;
    if (object.source) this.source = object.source;
    if (object.shippingId) this.shippingId = object.shippingId;
    if (object.shippingAmount || object.shippingAmount === 0) this.shippingAmount = object.shippingAmount;
    if (object.orderAmount) this.orderAmount = parseInt(object.orderAmount);
    if (object.orderQuantity) this.orderQuantity = parseInt(object.orderQuantity);
    if (object.status || object.status === 0) this.status = parseInt(object.status);
    if (object.note !== undefined) this.note = object.note;
    if (object.totalDiscount || object.totalDiscount === 0) this.totalDiscount = parseInt(object.totalDiscount);
    if (object.paymentType) this.paymentType = object.paymentType;
    if (object.shippingTime || object.shippingTime === null) this.shippingTime = object.shippingTime;
  }
}
