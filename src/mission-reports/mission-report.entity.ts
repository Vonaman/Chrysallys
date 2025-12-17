import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { MissionStep } from '../mission-step/mission-step.entity';
import { encryptionTransformer } from '../common/encryption.transformer';

@Entity()
export class MissionReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  @Column('text', { transformer: encryptionTransformer })
  details: string;

  @Column()
  agentRedacteur: string;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification' })
  dateModification: Date;

  @ManyToOne(() => MissionStep, (step) => step.id, { onDelete: 'CASCADE' })
  missionStep: MissionStep;
}
