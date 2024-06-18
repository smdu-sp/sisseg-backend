import { Controller, Get } from '@nestjs/common';
import { LdapService } from './ldap.service';

@Controller('ldap')
export class LdapController {
  constructor(private readonly ldapService: LdapService) {}

  @Get('desativados')
  async usuariosDesativados() {
    return await this.ldapService.usuariosDesativados();
  }

  @Get('inativos')
  async buscaUsuariosInativos() {
    return await this.ldapService.buscaUsuariosInativos(30);
  }
  
}
