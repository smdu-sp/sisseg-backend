/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Client, createClient, SearchOptions } from 'ldapjs';
import { timestamp } from 'rxjs';

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

    const lastLogons = [];

    const hoje = new Date();
    const dataLimite = hoje.getTime() - dias * 24 * 60 * 60 * 1000;

    for (const ldapserver of ldapServers) {
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
              reject(new UnauthorizedException('Credenciais incorretas.'));
            }
            resolve();
          },
        );
        const resposta = await new Promise<void>((resolve, reject) => {
          const opts: SearchOptions = {
            filter:
              '(&(objectClass=user))',
            scope: 'sub',
            attributes: ['samaccountname', 'cn', 'mail', 'lastlogontimestamp'],
          };
          client.search('ou=Users,ou=SMUL,dc=rede,dc=sp', opts, (err, res) => {
            if (err) {
              client.destroy();
              reject(err);
            } else {              
              res.on('searchEntry', (entries) => {
              entries.attributes.map((entry) => {
                if (entry['lastlogontimestamp']) {
                  const usuario = entry['samaccountname'][0];
                  const lastlogontimestamp = entry['lastlogontimestamp'][0];
                  const nome = entry['cn'][0];
                  const email = entry['mail'][0];
                  if (!lastLogons[usuario] || lastlogontimestamp > lastLogons[usuario]['timestamp']) {
                    lastLogons[usuario] = { timestamp: lastlogontimestamp, nome, email };
                  }                  
                }                
              })
                client.destroy();
                resolve();

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
          console.log(lastLogons)
        });
      });
    }
    console.log(lastLogons);
  }
}
