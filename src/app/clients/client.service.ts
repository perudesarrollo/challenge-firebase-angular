import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Client } from './client'
@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private dbPath = '/clients';
  clientRef: AngularFireList<Client> = null;
  constructor(private db: AngularFireDatabase) {
    this.clientRef = db.list(this.dbPath, ref => ref.orderByChild('birth_date'));
  }

  createClient(Client: Client): void {
    this.clientRef.push(Client);
  }

  updateClient(key: string, value: any): Promise<void> {
    return this.clientRef.update(key, value);
  }

  deleteClient(key: string): Promise<void> {
    return this.clientRef.remove(key);
  }

  getClientsList(): AngularFireList<Client> {
    return this.clientRef;
  }

  deleteAll(): Promise<void> {
    return this.clientRef.remove();
  }
}
