import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('varchar', { nullable: true })
  picture: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('boolean', { default: true })
  isProduct: boolean;

  @Column('varchar')
  slug: string;

  @Column('integer', { default: 0 })
  sales: number;

  @Column('varchar')
  pageTitle: string;

  @Column('varchar', { nullable: true })
  title: string;

  @Column('varchar', { nullable: true, length: 320 })
  metaDescription: string;

  @Column('timestamptz', { nullable: true })
  timePublication: string;

  @Column('boolean', { default: false })
  status: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true, select: false })
  deletedAt: Date;

  setAttributes(object: any) {
    if (object.name) this.name = object.name;
    if (object.picture !== undefined) this.picture = object.picture;
    if (object.description !== undefined) this.description = object.description;
    if (object.isProduct === true || object.isProduct === false) this.isProduct = object.isProduct;
    if (object.slug) this.slug = object.slug;
    if (object.sales || object.sales === 0) this.sales = object.sales;
    if (object.pageTitle !== undefined) this.pageTitle = object.pageTitle;
    if (object.title !== undefined) this.title = object.title;
    if (object.metaDescription !== undefined) this.metaDescription = object.metaDescription;
    if (object.timePublication || object.timePublication === null) this.timePublication = object.timePublication;
    if (object.status === true || object.status === false) this.status = object.status;
  }
}
