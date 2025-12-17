import { Controller, Get, Post, Body, Render, Res } from '@nestjs/common';
import { MissionsService } from './missions/missions.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  @Render('index')
  home() {
    return {};
  }

  @Get('missions-view')
  @Render('missions')
  async missions() {
    const missions = await this.missionsService.findAll();
    return { missions };
  }

  // 👇 NOUVELLE MÉTHODE POST
  @Post('missions-create')
  async createMission(@Body() body: any, @Res() res: Response) {
    await this.missionsService.create({
      titre: body.titre,
      statut: body.statut,
      agentReferent: body.agentReferent,
    });

    return res.redirect('/missions-view');
  }
}
