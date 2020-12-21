import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, DeleteDateColumn } from 'typeorm';
@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  itemCode: string;

  @Column('varchar')
  name: string;

  @Column('jsonb')
  slugs: string[];

  @Column('varchar', { nullable: true })
  description: string;

  @Column('boolean', { default: false })
  status: boolean;

  @Column('timestamptz', { nullable: true })
  timePublication: string;

  @Column('varchar', { nullable: true })
  tags: string;

  @Column('varchar', { nullable: true })
  bottleType: string;

  @Column('varchar', { nullable: true })
  unit: string;

  @Column('varchar', { nullable: true })
  metaDescription: string;

  @Column('varchar', { nullable: true })
  alt: string;

  @Column('integer', { default: 0 })
  rate: number;

  @Column('varchar', { nullable: true })
  title: string;

  @Column('varchar', { nullable: true })
  pageTitle: string;

  @Column('varchar', { nullable: true })
  shortDescription: string;

  @Column('integer', { default: 0 })
  numberToppingAllow: number; //allow buy number of topping when order

  @Column('boolean', { default: true })
  sellOutOfStock: boolean; //allow order when inStock = 0

  @Column('boolean', { default: false })
  toppingAvailable: boolean;

  @Column('integer')
  price: number;

  @Column('integer', { nullable: true })
  volume: number;

  @Column('varchar', { nullable: true })
  flavor: string;

  @Column('integer', { default: 0 })
  inStock: number;

  @Column('boolean', { default: false })
  allowSelectSugar: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true, select: false })
  deletedAt: Date;

  setAttributes(object: any) {
    if (object.itemCode) this.itemCode = object.itemCode;
    if (object.name) this.name = object.name;
    if (object.description !== undefined) this.description = object.description;
    if (object.status === true || object.status === false) this.status = object.status;
    if (object.timePublication || object.timePublication === null) this.timePublication = object.timePublication;
    if (object.bottleType !== undefined) this.bottleType = object.bottleType;
    if (object.unit !== undefined) this.unit = object.unit;
    if (object.metaDescription !== undefined) this.metaDescription = object.metaDescription;
    if (object.alt !== undefined) this.alt = object.alt;
    if (object.rate || object.rate === 0) this.rate = parseInt(object.rate);
    if (object.title !== undefined) this.title = object.title;
    if (object.pageTitle !== undefined) this.pageTitle = object.pageTitle;
    if (object.shortDescription !== undefined) this.shortDescription = object.shortDescription;
    if (object.numberToppingAllow) this.numberToppingAllow = parseInt(object.numberToppingAllow);
    if (object.sellOutOfStock === true || object.sellOutOfStock === false) this.sellOutOfStock = object.sellOutOfStock;
    if (object.allowSelectSugar === true || object.allowSelectSugar === false)
      this.allowSelectSugar = object.allowSelectSugar;
    if (object.toppingAvailable === true || object.toppingAvailable === false)
      this.toppingAvailable = object.toppingAvailable;
    if (object.price || object.price === 0) this.price = parseInt(object.price);
    if (object.volume || object.volume === 0) this.volume = parseInt(object.volume);
    if (object.flavor !== undefined) this.flavor = object.flavor;
    if (object.inStock || object.inStock === 0) this.inStock = parseInt(object.inStock);
  }
}
