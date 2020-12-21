import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  DeleteDateColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  email: string;

  @Column('varchar')
  password: string;

  @Column('varchar')
  roleId: string;

  @Column('varchar')
  fullName: string;

  @Column('varchar')
  phone: string;

  @Column('int2', { nullable: true })
  gender: number;

  @Column('varchar', { nullable: true })
  avatar: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true, select: false })
  deletedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  setAttributes(object: any) {
    if (object.email) this.email = object.email;
    if (object.password) this.password = object.password;
    if (object.roleId) this.roleId = object.roleId;
    if (object.fullName) this.fullName = object.fullName;
    if (object.phone) this.phone = object.phone;
    if (object.gender || object.gender === 0 || object.gender !== undefined) this.gender = object.gender;
    if (object.avatar !== undefined) this.avatar = object.avatar;
  }
}
