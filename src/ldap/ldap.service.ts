/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as ldap from 'ldapjs';

@Injectable()
export class LdapService {
  private client: ldap.Client;

  constructor() {
    this.client = ldap.createClient({
      url: 'ldap://10.10.53.10',
    });
  }

  async getUsers(): Promise<any> {
    return new Promise((resolve, reject) => {
      const opts: ldap.SearchOptions = {
        filter: '(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=2))',
        scope: 'sub',
        attributes: ['samaccountname', 'cn', 'mail'],
      };

      this.client.bind('usr_smdu_freenas', 'Prodam01', (err) => {
        if (err) {
          //this.client.destroy();
          reject(err);
        } else {
          this.client.search('ou=Users,ou=SMUL,dc=rede,dc=sp', opts, (err, res) => {
            if (err) {
              //this.client.destroy();
              reject(err);
            } else {
              const users = [];
              res.on('searchEntry', (entry) => {
                users.push(entry.attributes);                
              });
              res.on('end', () => {
                //this.client.destroy();
                resolve(users);
              });
              res.on('error', (err) => {
               // this.client.destroy();
                reject(err);
              });
            }
          });
        }
      });
    });
  }
}


