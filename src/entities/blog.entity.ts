import { EBlogStatus } from '../lib/constant';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  categoryBlogId: string;

  @Column('varchar')
  title: string;

  @Column('varchar')
  pageTitle: string;

  @Column('text', { nullable: true })
  content: string;

  @Column('varchar', { nullable: true })
  excerpt: string;

  @Column('varchar', { nullable: true })
  type: string;

  @Column('varchar', { nullable: true })
  permalink: string;

  @Column('varchar', { nullable: true })
  imageTitle: string;

  @Column('varchar', { nullable: true })
  imageCaption: string;

  @Column('varchar', { nullable: true })
  imageDescription: string;

  @Column('varchar', { nullable: true })
  imageAltText: string;

  @Column('varchar', { nullable: true })
  imageFeatured: string;

  @Column('varchar', { nullable: true })
  tags: string;

  @Column('varchar', { nullable: true })
  prominentWords: string;

  @Column('uuid')
  authorId: string;

  @Column('uuid')
  createdBy: string;

  @Column('jsonb')
  slugs: string[];

  @Column('integer', { nullable: true })
  position: number;

  @Column('varchar', { default: EBlogStatus.PUBLISH })
  status: string;

  @Column('varchar', { nullable: true })
  format: string;

  @Column('varchar', { nullable: true })
  template: string;

  @Column('varchar', { nullable: true })
  parent: string;

  @Column('varchar', { nullable: true })
  parentSlug: string;

  @Column('varchar', { nullable: true })
  order: string;

  @Column('varchar', { nullable: true })
  commentStatus: string;

  @Column('varchar', { nullable: true })
  pingStatus: string;

  @Column('varchar', { nullable: true })
  metaDescription: string;

  @Column('timestamptz', { nullable: true })
  timePublication: string;

  @Column('varchar', { nullable: true })
  shortDescription: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true, select: false })
  deletedAt: Date;

  setAttributes(object: any) {
    if (object.title) this.title = object.title;
    if (object.pageTitle !== undefined) this.pageTitle = object.pageTitle;
    if (object.imageFeatured !== undefined) this.imageFeatured = object.imageFeatured;
    if (object.content) this.content = object.content;
    if (object.type !== undefined) this.type = object.type;
    if (object.authorId) this.authorId = object.authorId;
    if (object.categoryBlogId) this.categoryBlogId = object.categoryBlogId;
    if (object.createdBy) this.createdBy = object.createdBy;
    if (object.status) this.status = object.status;
    if (object.metaDescription !== undefined) this.metaDescription = object.metaDescription;
    if (object.timePublication || object.timePublication === null) this.timePublication = object.timePublication;
    if (object.shortDescription) this.shortDescription = object.shortDescription;
  }
}
