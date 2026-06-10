import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private community: CommunityService) {}

  @Public()
  @Get('overview')
  @ApiOperation({ summary: 'Homepage community payload (stats, activity, leaderboard, featured)' })
  getOverview() {
    return this.community.getOverview();
  }

  @Public()
  @Get('stats')
  @ApiOperation({ summary: 'Live community stats' })
  getStats() {
    return this.community.getStats();
  }

  @Public()
  @Get('activity')
  @ApiOperation({ summary: 'Recent community activity feed' })
  getActivity(@Query('limit') limit?: string) {
    return this.community.getActivity(limit ? parseInt(limit, 10) : 8);
  }

  @Public()
  @Get('leaderboard')
  @ApiOperation({ summary: 'Top active players' })
  getLeaderboard(@Query('limit') limit?: string) {
    return this.community.getLeaderboard(limit ? parseInt(limit, 10) : 10);
  }
}
