/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Client, createClient, SearchOptions } from 'ldapjs';

@Injectable()
export class LdapService {
  constructor() {}

  async getUsers(): Promise<any> {
    const client: Client = createClient({
      url: process.env.LDAP_SERVER,
    });
    await new Promise<void>((resolve, reject) => {
      client.bind(`${process.env.USER_LDAP}${process.env.LDAP_DOMAIN}`, process.env.PASS_LDAP, (err: any) => {
        if (err) {
          client.destroy();
          reject(new UnauthorizedException('Credenciais incorretas.'));
        }
        resolve();
      });
    });
    const resposta = await new Promise((resolve, reject) => {
      const opts: SearchOptions = {
        filter: '(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=2))',
        scope: 'sub',
        attributes: ['samaccountname', 'cn', 'mail'],
      };
      client.search('ou=Users,ou=SMUL,dc=rede,dc=sp', opts, (err, res) => {
        if (err) {
          client.destroy();
          reject(err);
        } else {
          const users = [];
          res.on('searchEntry', (entry) => {
            users.push(entry.attributes);
            client.destroy();
            resolve(users);
          });
          res.on('error', (err) => {
            client.destroy();
            reject(err);
          });
          res.on('end', () => {
            client.destroy();
            reject(err);
          });
        }
      });
    });
    return resposta;
  }
}


