import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Mission } from '../missions/mission.entity';

@Entity()
export class MissionStep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  statut: string;

  @Column()
  agentAssigne: string;

  @Column({ nullable: true })
  localisation: string;

  @Column({ type: 'date', nullable: true })
  dateDebut: Date;

  @Column({ type: 'date', nullable: true })
  dateFin: Date;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification' })
  dateModification: Date;

  @ManyToOne(() => Mission, (mission) => mission.id, { onDelete: 'CASCADE' })
  mission: Mission;
}
