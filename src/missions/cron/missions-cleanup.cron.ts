import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MissionsService } from '../missions.service';

@Injectable()
export class MissionsCleanupCron {
    private readonly logger = new Logger(MissionsCleanupCron.name);

    constructor(private readonly missionsService: MissionsService) {}

    /**
     * Supprime les missions ANNULE ou TERMINE depuis plus de 1 an
     * Tous les jours à 02h00
    */
  @Cron('0 2 * * *')
    async handleCleanup() {
        this.logger.log('Starting missions cleanup job');

        const deletedCount =
        await this.missionsService.deleteOldCompletedMissions(365);

        this.logger.log(`Missions cleanup done (${deletedCount} deleted)`);
    }
}
