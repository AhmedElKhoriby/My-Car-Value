import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  lng: number; // longitude

  @Column()
  lat: number; // latitude

  @Column()
  mileage: number;
}
