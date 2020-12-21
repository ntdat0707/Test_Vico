import { EShippingPlace } from '../lib/constant';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity()
export class Shipping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  customerId: string;

  @Column('varchar')
  name: string;

  @Column('varchar')
  phoneNumber: string;

  @Column('integer', { nullable: true })
  provinceId: number;

  @Column('integer', { nullable: true })
  districtId: number;

  @Column('integer', { nullable: true })
  wardId: number;

  @Column('varchar')
  address: string;

  @Column('varchar', { default: EShippingPlace.HOME })
  place: string;

  @Column('boolean', { default: false })
  isHaveOrder: boolean;

  @Column('boolean', { default: true })
  status: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  setAttributes(object: any) {
    if (object.customerId) this.customerId = object.customerId;
    if (object.name) this.name = object.name;
    if (object.phoneNumber) this.phoneNumber = object.phoneNumber;
    if (object.provinceId || object.provinceId === null) this.provinceId = object.provinceId;
    if (object.districtId || object.districtId === null) this.districtId = object.districtId;
    if (object.wardId || object.wardId === null) this.wardId = object.wardId;
    if (object.address) this.address = object.address;
    if (object.place !== undefined) this.place = object.place;
    if (object.status === true || object.status === false) this.status = object.status;
  }
}
