import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, DeleteDateColumn } from 'typeorm';
@Entity()
export class Topping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  categoryId: string;

  @Column('varchar')
  name: string;

  @Column('integer')
  price: number;

  @Column('varchar', { nullable: true })
  unit: string;

  @Column('boolean', { default: true })
  trackQuantity: boolean; //when true required in_stock

  @Column('integer', { default: 0 })
  inStock: number;

  @Column('varchar', { nullable: true })
  picture: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true, select: false })
  deletedAt: Date;

  setAttributes(object: any) {
    if (object.categoryId) this.categoryId = object.categoryId;
    if (object.name) this.name = object.name;
    if (object.price || object.price === 0) this.price = parseInt(object.price);
    if (object.price !== undefined) this.unit = object.unit;
    if (object.trackQuantity === true || object.trackQuantity === false) this.trackQuantity = object.trackQuantity;
    if (object.inStock || object.inStock === 0) this.inStock = parseInt(object.inStock);
  }
}
