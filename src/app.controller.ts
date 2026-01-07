import { Controller, Get, Post, Body, Render, Res } from '@nestjs/common';
import { MissionsService } from './missions/missions.service';
import { MissionStepsService } from './mission-step/mission-step.service';
import { MissionReportsService } from './mission-reports/mission-report.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly missionsService: MissionsService,
    private readonly missionStepsService: MissionStepsService,
    private readonly missionReportsService: MissionReportsService,
  ) {}

  @Get()
  @Render('index')
  home() {
    return {};
  }

  @Get('auth')
  @Render('auth')
  authPage() {
    return {};
  }

  @Get('missions')
  @Render('missions')
  async missionsList() {
    const missions = await this.missionsService.findAll();
    return { missions };
  }

  @Post('missions-create')
  async createMission(@Body() body: any, @Res() res: Response) {
    await this.missionsService.create({
      titre: body.titre,
      statut: body.statut,
      agentReferent: body.agentReferent,
    });

    return res.redirect('/missions');
  }

  @Get('mission-step')
  @Render('mission-step')
  async missionStepsList() {
    const missionSteps = await this.missionStepsService.findAll();
    const missions = await this.missionsService.findAll();
    return { missionSteps, missions };
  }

  @Get('mission-reports')
  @Render('mission-reports')
  async missionReportsList() {
    const missionReports = await this.missionReportsService.findAll();
    const missionSteps = await this.missionStepsService.findAll();
    return { missionReports, missionSteps };
  }
}