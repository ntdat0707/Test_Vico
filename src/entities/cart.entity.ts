import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  customerId: string;

  @Column('uuid')
  productVariantId: string;

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
    if (object.productVariantId) this.productVariantId = object.productVariantId;
    if (object.quantity) this.quantity = parseInt(object.quantity);
    if (object.sugar || object.sugar === 0) this.sugar = parseInt(object.sugar);
  }
}
