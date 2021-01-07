import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity()
export class BlogTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  tag: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  setAttributes(object: any) {
    if (object.tag) this.tag = object.tag;
  }
}
