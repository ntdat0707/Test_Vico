import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';

@Entity()
export class CategoryBlog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: true })
  picture: string;

  @Column('varchar')
  name: string;

  @Column('uuid', { nullable: true })
  parentId: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar')
  slug: string;

  @Column('boolean', { default: false })
  isHaveChildren: boolean;

  @Column('boolean', { default: true })
  status: boolean;

  @Column('integer', { nullable: true })
  position: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  deletedAt: Date;

  setAttributes(object: any) {
    if (object.name) this.name = object.name;
    if (object.parentId) this.parentId = object.parentId;
    if (object.description !== undefined) this.description = object.description;
    if (object.slug) this.slug = object.slug;
  }
}
