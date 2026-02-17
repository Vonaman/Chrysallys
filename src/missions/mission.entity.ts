import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Mission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;

  @Column()
  statut: string;

  @Column()
  agentReferent: string;

  @Column({ type: 'date', nullable: true })
  dateDebut: Date;

  @Column({ type: 'date', nullable: true })
  dateFin: Date;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification' })
  dateModification: Date;
}

//test pull