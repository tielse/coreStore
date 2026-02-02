/**
 * User REST Controller
 * - Controller chỉ điều phối request/response
 * - Không chứa business logic
 * - Không gọi repository / domain trực tiếp
 */

import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';

import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { AssignGroupUseCase } from '../../application/use-cases/assign-group.use-case';

import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { UserResponseDto } from '../../application/dto/user.response.dto';

import {
  ResponseBuilder,
  IApiResponse,
} from '../../../../shared/response/index.response';

import { AuthGuard } from '../../../auth/interfaces/guards/auth-guard.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly assignGroupUseCase: AssignGroupUseCase,
    private readonly responseBuilder: ResponseBuilder,
  ) {}

  // ========================
  // CREATE
  // ========================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() dto: CreateUserDto,
    @Req() req: any,
  ): Promise<IApiResponse<UserResponseDto>> {
    const modifiedBy = req.user?.sub ?? 'system';

    const user = await this.createUserUseCase.execute(dto, modifiedBy);

    return this.responseBuilder.success(user, {
      code: 'CREATE_USER_201',
      message: 'User created successfully',
    });
  }

  // ========================
  // UPDATE
  // ========================
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ): Promise<IApiResponse<UserResponseDto>> {
    const modifiedBy = req.user?.sub ?? 'system';

    const user = await this.updateUserUseCase.execute(id, dto, modifiedBy);

    return this.responseBuilder.success(user, {
      code: 'UPDATE_USER_200',
      message: 'User updated successfully',
    });
  }

  // ========================
  // ASSIGN GROUP
  // ========================
  @Post(':userId/groups/:groupId')
  @HttpCode(HttpStatus.OK)
  async assignGroup(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
    @Req() req: any,
  ): Promise<IApiResponse<void>> {
    const modifiedBy = req.user?.sub ?? 'system';

    await this.assignGroupUseCase.execute(userId, groupId, modifiedBy);

    return this.responseBuilder.success(null, {
      code: 'ASSIGN_GROUP_200',
      message: 'Group assigned successfully',
    });
  }
}
