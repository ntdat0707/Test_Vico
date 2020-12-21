import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { JwtConfig } from './jwtConfig.class';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { PermissionRole } from '../entities/permissionRole.entity';
import { RoleService } from '../role/role.service';
import { Customer } from '../entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, PermissionRole, Customer]),
    // PassportModule.register({ defaultStrategy: 'JwtStrategy' }),
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
  ],
  providers: [AuthService, JwtStrategy, RoleService],
  controllers: [AuthController],
  // exports: [PassportModule],
})
export class AuthModule {}
