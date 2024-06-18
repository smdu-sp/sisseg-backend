/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Client, createClient, SearchOptions } from 'ldapjs';
import { last, timestamp } from 'rxjs';

@Injectable()
export class LdapService {
  constructor() {}

  async usuariosDesativados(): Promise<any> {
    const client: Client = createClient({
      url: process.env.LDAP_SERVER,
    });
    await new Promise<void>((resolve, reject) => {
      client.bind(
        `${process.env.USER_LDAP}${process.env.LDAP_DOMAIN}`,
        process.env.PASS_LDAP,
        (err: any) => {
          if (err) {
            client.destroy();
            reject(new UnauthorizedException('Credenciais incorretas.'));
          }
          resolve();
        },
      );
    });
    const resposta = await new Promise((resolve, reject) => {
      const opts: SearchOptions = {
        filter:
          '(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=2))',
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
  async buscaUsuariosInativos(dias: number): Promise<any> {
    if (!dias) dias = 30;
    const ldapServers = [
      'ldap://10.10.53.10',
      'ldap://10.10.53.11',
      'ldap://10.10.53.12',
      'ldap://10.10.64.213',
      'ldap://10.10.65.242',
      'ldap://10.10.65.90',
      'ldap://10.10.65.91',
      'ldap://10.10.66.85',
      'ldap://10.10.68.42',
      'ldap://10.10.68.43',
      'ldap://10.10.68.44',
      'ldap://10.10.68.45',
      'ldap://10.10.68.46',
      'ldap://10.10.68.47',
      'ldap://10.10.68.48',
      'ldap://10.10.68.49',
    ];

    const lastLogons: { nome: string, usuario: string, timestamp: number, mail: string }[] = [];
    const hoje = new Date();
    const dataLimite = Math.floor((hoje.getTime() - dias * 24 * 60 * 60 * 1000) / 1000);

    for (const ldapserver of ldapServers) {
      for (var tentativa = 0; tentativa < 3; tentativa++){
        try {
          const client: Client = createClient({
            url: ldapserver,
          });
          await new Promise<void>(async (resolve, reject) => {
            client.bind(
              `${process.env.USER_LDAP}${process.env.LDAP_DOMAIN}`,
              process.env.PASS_LDAP,
              (err: any) => {
                if (err) {
                  client.destroy();
                  resolve();
                }
                resolve();
              },
            );
            await new Promise<void>((resolve, reject) => {
              const opts: SearchOptions = {
                filter:
                  '(&(objectClass=user))',
                scope: 'sub',
                attributes: ['samaccountname', 'cn', 'mail', 'lastlogontimestamp'],
              };
              client.search('ou=Users,ou=SMUL,dc=rede,dc=sp', opts, (err, res) => {
                if (err) {
                  client.destroy();
                  resolve();
                } else {              
                  res.on('searchEntry', (entry) => {
                    const nome = entry.attributes[0] && entry.attributes[0].values[0];
                    const usuario = entry.attributes[1] && entry.attributes[1].values[0].toLocaleLowerCase();
                    const timestamp = entry.attributes[2] && Math.floor(parseInt(entry.attributes[2].values[0])/10000000) - 11644473600;
                    const mail = entry.attributes[3] && entry.attributes[3].values[0].toLocaleLowerCase();
                    const indexFound = lastLogons.findIndex((registro) => registro.usuario === usuario);
                    if (indexFound < 0) {
                      lastLogons.push({ nome, usuario, timestamp, mail });
                    } else {
                      if (lastLogons[indexFound].timestamp < timestamp) {
                        lastLogons[indexFound].timestamp = timestamp;
                      }
                    }
                    client.destroy();
                    resolve();
                  });
                  res.on('error', (err) => {
                    client.destroy();
                    resolve();
                  });
                  res.on('end', () => {
                    client.destroy();
                    resolve();
                  });
                }
              });
            });
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
    return lastLogons.filter((registro) => registro.timestamp < dataLimite).sort((a, b) => a.timestamp - b.timestamp);
  }
}
