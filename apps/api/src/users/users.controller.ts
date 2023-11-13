import {
  Body,
  Controller,
  Get,
  // Param,
  Query,
  Post,
  Param,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  /*
   this end-point is to get a user and all of its schedules.
   END-POINTS:
   localhost:3000/api/users/aa8d3bb6-b4ac-4ccc-b4e7-5b78ae6eb4ae?upcoming=true
   localhost:3000/api/users/aa8d3bb6-b4ac-4ccc-b4e7-5b78ae6eb4ae?previous=true
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('upcoming', new DefaultValuePipe(false), ParseBoolPipe)
    upcoming?: boolean,
    @Query('previous', new DefaultValuePipe(false), ParseBoolPipe)
    previous?: boolean,
  ): Promise<User> {
    return this.usersService.findOne(id, upcoming, previous);
  }

  // findAll users to display on "/" page.
  // Once user is picked, we'll navigate to:
  // /coaches/aa8d3bb6-b4ac-4ccc-b4e7-5b78ae6eb4ae OR /students/aa8d3bb6-b4ac-4ccc-b4e7-5b78ae6eb4ae
  @Get() // localhost:3000/api/users
  findAll(): Promise<Array<User>> {
    return this.usersService.findAll();
  }

  @Post()
  createUser(@Body() body: CreateUserDto): Promise<User> {
    return this.usersService.createUser(body);
  }
}
