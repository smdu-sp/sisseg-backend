import { Controller, Get, Query } from '@nestjs/common';
import { LdapService } from './ldap.service';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('ldap')
export class LdapController {
  constructor(private readonly ldapService: LdapService) {}

  @Get('desativados')
  async usuariosDesativados() {
    return await this.ldapService.usuariosDesativados();
  }

  @IsPublic()
  @Get('inativos')
  async buscaUsuariosInativos(@Query('dias') dias: string) {
    return await this.ldapService.buscaUsuariosInativos(+dias);
  }
  
}
