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
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  code: string;

  @Column('varchar', { nullable: true })
  email: string;

  @Column('varchar', { nullable: true })
  phoneNumber: string;

  @Column('varchar')
  fullName: string;

  @Column('varchar')
  password: string;

  @Column('varchar', { nullable: true })
  googleId: string;

  @Column('varchar', { nullable: true })
  facebookId: string;

  @Column('uuid', { nullable: true })
  shippingDefaultId: string;

  @Column('int2', { default: 0 })
  gender: number;

  @Column('date', { nullable: true })
  birthDay: Date;

  @Column('varchar', { nullable: true })
  avatar: string;

  @Column('varchar', { nullable: true })
  address: string;

  @Column('boolean', { default: true })
  acceptEmailMkt: boolean;

  @Column('boolean', { default: true })
  isActive: boolean;

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
    if (object.code) this.code = object.code;
    if (object.phoneNumber) this.phoneNumber = object.phoneNumber;
    if (object.fullName) this.fullName = object.fullName;
    if (object.password) this.password = object.password;
    if (object.googleId !== undefined) this.googleId = object.googleId;
    if (object.facebookId !== undefined) this.facebookId = object.facebookId;
    if (object.shippingDefaultId || object.shippingDefaultId === null)
      this.shippingDefaultId = object.shippingDefaultId;
    if (object.gender || object.gender === 0) this.gender = object.gender;
    if (object.birthDay || object.birthDay === null) this.birthDay = object.birthDay;
    if (object.avatar !== undefined) this.avatar = object.avatar;
    if (object.address !== undefined) this.address = object.address;
    if (object.acceptEmailMkt === true || object.acceptEmailMkt === false) this.acceptEmailMkt = object.acceptEmailMkt;
  }
}
