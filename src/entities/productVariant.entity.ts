import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, DeleteDateColumn } from 'typeorm';
@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  @Column('varchar')
  itemCode: string;

  @Column('varchar')
  name: string;

  @Column('integer')
  price: number;

  @Column('varchar', { nullable: true })
  volume: string;

  @Column('varchar', { nullable: true })
  flavor: string;

  @Column('varchar', { nullable: true })
  unit: string;

  @Column('integer', { default: 0 })
  inStock: number;

  @Column('varchar', { nullable: true })
  avatar: string;

  @Column('varchar', { nullable: true })
  alt: string;

  @Column('integer', { nullable: true })
  position: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true, select: false })
  deletedAt: Date;

  setAttributes(object: any) {
    if (object.productId) this.productId = object.productId;
    if (object.itemCode) this.itemCode = object.itemCode;
    if (object.name) this.name = object.name;
    if (object.unit !== undefined) this.unit = object.unit;
    if (object.price || object.price === 0) this.price = parseInt(object.price);
    if (object.volume || object.volume === null) this.volume = object.volume;
    if (object.flavor || object.flavor === null) this.flavor = object.flavor;
    if (object.avatar !== undefined) this.avatar = object.avatar;
    if (object.alt !== undefined) this.alt = object.alt;
    if (object.inStock || object.inStock === 0) this.inStock = parseInt(object.inStock);
  }
}
