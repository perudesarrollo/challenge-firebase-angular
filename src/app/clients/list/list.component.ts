import { Component, OnInit } from '@angular/core';
import { ClientService } from '../client.service';
import { map } from 'rxjs/operators';
import { NgbModal, NgbModalRef, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Client } from '../client';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.sass']
})
export class ListComponent implements OnInit {
  closeResult = '';
  angForm: FormGroup;
  modal: NgbModalRef;
  ages: number = 0;
  clientNull = {
    key: true,
    name: null,
    last_name: null,
    birth_date: null,
    age: null,
    death: null,
  };

  client: Client = new Client();
  promedioEdad: number = 0;
  promedioMuerte: number = 79;

  clients: any;
  constructor(
    private clientService: ClientService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.getClientsList();
  }

  createForm() {
    this.angForm = this.fb.group({
      key: ['', Validators.required],
      name: ['', Validators.required],
      last_name: ['', Validators.required],
      birth_date: ['', Validators.required],
      age: [''],
      death: ['']
    });
  }

  getClientsList() {
    this.clientService.getClientsList().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.payload.key, age: this.calculateAge(c.payload.val().birth_date), death: this.calculateDeath(c.payload.val().birth_date), ...c.payload.val() })
        )
      )
    ).subscribe(clients => {
      if (clients.length) {
        this.ages = parseFloat(clients.map(c => c.age).reduce((p, c) => c += p ));
        this.promedioEdad = Math.round(this.ages / clients.length);
        this.clients = clients;
      }
    });
  }

  calculateAge(date) {
    const convertAge = new Date(date);
    const timeDiff = Math.abs(Date.now() - convertAge.getTime());
    return Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
  }

  calculateDeath(birthDate) {
    return new Date().getFullYear() - (this.calculateAge(birthDate) - this.promedioMuerte)
  }

  deleteClients() {
    Swal.fire({
      title: 'Estas seguro?',
      text: 'Una vez eliminado, ¡no podrá recuperar!',
      icon: 'warning',
      showCancelButton: true
    })
      .then((result) => {
        if (result.value) {
          Swal.fire('Deleted!', 'Eleminado con éxito', 'success');
          this.clientService.deleteAll().catch(err => console.log(err));
        }
      });

  }

  addClient(content) {
    this.angForm.setValue(this.clientNull);
    this.modal = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  onSubmit() {
    if (this.angForm.value.key == true) {
      delete this.angForm.value.key;
      this.clientService.createClient(this.angForm.value);
    } else {
      this.clientService
        .updateClient(this.angForm.value.key, this.angForm.value)
        .catch(err => console.log(err));
    }
    this.modal.close();
  }

  editClient(content, item) {
    this.angForm.setValue(item);
    this.modal = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  removeClient(item) {
    Swal.fire({
      title: 'Estas seguro?',
      text: 'Una vez eliminado, ¡no podrá recuperar!',
      icon: 'warning',
      showCancelButton: true
    })
      .then((result) => {
        if (result.value) {
          Swal.fire('Deleted!', 'Eleminado con éxito', 'success');
          this.clientService.deleteClient(item.key).catch(err => console.log(err));
        }
      });
  }
}
