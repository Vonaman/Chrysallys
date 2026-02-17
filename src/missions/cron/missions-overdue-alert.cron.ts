import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MissionsService } from '../missions.service';
import { Mission } from '../mission.entity';

@Injectable()
export class MissionsOverdueAlertCron {
  private readonly logger = new Logger(MissionsOverdueAlertCron.name);

  constructor(private readonly missionsService: MissionsService) {}

  /**
   * Vérifie toutes les 10 minutes si des missions EN_COURS sont dépassées
   */
  @Cron('*/10 * * * *')
  async handleOverdueMissions() {
    this.logger.log('Checking overdue missions');

    const overdueMissions =
      await this.missionsService.findOverdueMissions();

    if (overdueMissions.length === 0) {
      return;
    }

    overdueMissions.forEach((mission) => {
      this.logger.warn(
        `OVERDUE MISSION - id=${mission.id}, titre="${mission.titre}"`,
      );
    });
  }
}
