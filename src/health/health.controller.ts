import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { MissionsService } from '../missions/missions.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly missionsService: MissionsService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.db.pingCheck('database'),

      // ✅ check "métier" : on vérifie que la table Mission répond
      async () => {
        try {
          await this.missionsService.findAll(); // simple ping via repo
          return { missions: { status: 'up' } };
        } catch (e) {
          return { missions: { status: 'down' } };
        }
      },
      async () => {
        try {
          const total = await this.missionsService.count();
          return { missions: { status: 'up', total } };
        } catch {
          return { missions: { status: 'down' } };
        }
      },
    ]);
  }
}
