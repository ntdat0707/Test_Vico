import { Injectable, HttpException, HttpStatus, UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginCustomerInput, LoginManagerInput, RefreshTokenInput, RegisterAccountInput } from './auth.dto';
import { HttpExceptionFilter } from '../exception/httpException.filter';
import * as jwt from 'jsonwebtoken';
import { Role } from '../entities/role.entity';
import { Customer } from '../entities/customer.entity';
import { AuthPayload } from './payload';
import { jwtConstants } from './constants';
import { Employee } from '../entities/employee.entity';

@UseFilters(new HttpExceptionFilter())
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Employee) private employeeRepository: Repository<Employee>,
    private jwtService: JwtService,
    private connection: Connection,
  ) {}

  async verifyTokenClaims(payload: AuthPayload) {
    const customer = await this.customerRepository.findOne({
      where: { id: payload.id, email: payload.email, code: payload.code },
    });
    if (!customer) {
      const employee = await this.employeeRepository.findOne({
        where: { id: payload.id, email: payload.email, roleId: payload.roleId },
      });
      if (!employee) return false;
    }
    return true;
  }

  async login(loginUserInput: LoginCustomerInput) {
    const refreshTokenExpireIn = process.env.REFRESH_TOKEN_EXPIRE_IN || '7d';
    const customer = await this.customerRepository.findOne({ where: { email: loginUserInput.email } });
    if (!customer) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CUSTOMER_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordIsValid = bcrypt.compareSync(loginUserInput.password, customer.password);
    if (!passwordIsValid) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'INCORRECT_PASSWORD',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const payloadToken = { id: customer.id, email: customer.email, code: customer.code };
    const token = this.jwtService.sign(payloadToken);

    const payloadRefreshToken = {
      id: customer.id,
      email: customer.email,
      code: customer.code,
      token: token,
    };
    const refreshToken = jwt.sign(payloadRefreshToken, jwtConstants.secret, {
      expiresIn: refreshTokenExpireIn,
    });

    return { customerId: customer.id, token: token, refreshToken: refreshToken };
  }

  async register(avatar: any, registerAccountInput: RegisterAccountInput) {
    let existCustomer: Customer = await this.customerRepository.findOne({
      where: {
        email: registerAccountInput.email,
      },
    });

    if (existCustomer) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'EMAIL_EXISTED',
        },
        HttpStatus.CONFLICT,
      );
    }

    existCustomer = await this.customerRepository.findOne({
      where: {
        phoneNumber: registerAccountInput.phoneNumber,
      },
    });

    if (existCustomer) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'PHONE_EXISTED',
        },
        HttpStatus.CONFLICT,
      );
    }

    let newCustomer = new Customer();
    newCustomer.setAttributes(registerAccountInput);
    if (avatar) {
      newCustomer.avatar = avatar.filename;
    }
    let customerCode = '';
    while (true) {
      const random =
        Math.random()
          .toString(36)
          .substring(2, 4) +
        Math.random()
          .toString(36)
          .substring(2, 8);
      const randomCode = random.toUpperCase();
      customerCode = randomCode;
      const existCode = await this.customerRepository.findOne({
        where: {
          code: customerCode,
        },
      });
      if (!existCode) {
        break;
      }
    }
    newCustomer.code = customerCode;
    //clear cache
    await this.connection.queryResultCache.clear();
    newCustomer = await this.customerRepository.save(newCustomer);

    return {
      data: newCustomer,
    };
  }

  async refreshToken(refreshTokenInput: RefreshTokenInput) {
    const refreshTokenExpireIn = process.env.REFRESH_TOKEN_EXPIRE_IN || '7d';
    try {
      const refreshTokenPayload: any = jwt.verify(refreshTokenInput.refreshToken, jwtConstants.secret);
      if (refreshTokenInput.token !== refreshTokenPayload.token) {
        throw HttpException;
      }

      const existCustomer = await this.customerRepository.findOne({
        where: {
          id: refreshTokenPayload.id,
        },
      });
      if (!existCustomer) {
        throw HttpException;
      }

      const payloadToken = { id: existCustomer.id, email: existCustomer.email, code: existCustomer.code };
      const token = this.jwtService.sign(payloadToken);

      const payloadRefreshToken = {
        id: existCustomer.id,
        email: existCustomer.email,
        code: existCustomer.code,
        token: token,
      };
      const refreshToken = jwt.sign(payloadRefreshToken, jwtConstants.secret, {
        expiresIn: refreshTokenExpireIn,
      });

      return { customerId: existCustomer.id, token: token, refreshToken: refreshToken };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'INVALID_TOKEN',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async loginManager(loginManagerInput: LoginManagerInput) {
    const refreshTokenExpireIn = process.env.REFRESH_TOKEN_EXPIRE_IN || '7d';
    const employee = await this.employeeRepository.findOne({ where: { email: loginManagerInput.email } });
    if (!employee) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'EMPLOYEE_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordIsValid = bcrypt.compareSync(loginManagerInput.password, employee.password);
    if (!passwordIsValid) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'INCORRECT_PASSWORD',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const payloadToken = { id: employee.id, email: employee.email, roleId: employee.roleId };
    const token = this.jwtService.sign(payloadToken);

    const payloadRefreshToken = {
      id: employee.id,
      email: employee.email,
      roleId: employee.roleId,
      token: token,
    };
    const refreshToken = jwt.sign(payloadRefreshToken, jwtConstants.secret, {
      expiresIn: refreshTokenExpireIn,
    });

    return { employeeId: employee.id, token: token, refreshToken: refreshToken };
  }

  async refreshTokenManager(refreshTokenInput: RefreshTokenInput) {
    const refreshTokenExpireIn = process.env.REFRESH_TOKEN_EXPIRE_IN || '7d';
    try {
      const refreshTokenPayload: any = jwt.verify(refreshTokenInput.refreshToken, jwtConstants.secret);
      if (refreshTokenInput.token !== refreshTokenPayload.token) {
        throw HttpException;
      }

      const existEmployee = await this.employeeRepository.findOne({
        where: {
          id: refreshTokenPayload.id,
        },
      });
      if (!existEmployee) {
        throw HttpException;
      }

      const payloadToken = { id: existEmployee.id, email: existEmployee.email, roleId: existEmployee.roleId };
      const token = this.jwtService.sign(payloadToken);

      const payloadRefreshToken = {
        id: existEmployee.id,
        email: existEmployee.email,
        roleId: existEmployee.roleId,
        token: token,
      };
      const refreshToken = jwt.sign(payloadRefreshToken, jwtConstants.secret, {
        expiresIn: refreshTokenExpireIn,
      });

      return { employeeId: existEmployee.id, token: token, refreshToken: refreshToken };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'INVALID_TOKEN',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getProfile(customerId: string) {
    const existCustomer = await this.customerRepository.findOne({
      where: {
        id: customerId,
      },
    });

    if (!existCustomer) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CUSTOMER_NOT_EXIST',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      data: existCustomer,
    };
  }

  async getProfileAdmin(employeeId: string) {
    const existEmployee = await this.employeeRepository.findOne({
      where: {
        id: employeeId,
      },
    });

    if (!existEmployee) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'EMPLOYEE_NOT_EXIST',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      data: existEmployee,
    };
  }
}
