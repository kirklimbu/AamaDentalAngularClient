import { Router } from "@angular/router";
import { Customer } from "src/app/core/models/customer";
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";

import { ClientService } from "../../services/client.service";
import { Observable } from "rxjs";
import { finalize, tap } from "rxjs/operators";
import { FormatDate } from "src/app/core/constants/format-date";
// project
import { CustomJs } from "src/app/shared/customjs/custom.js";
import { DateFormatter } from "angular-nepali-datepicker";
import { MatDialog } from "@angular/material";
import { CustomerFormComponent } from "../../shared/customer-form/customer-form.component";

@Component({
  selector: "app-client",
  templateUrl: "./customer.component.html",
  styleUrls: ["./customer.component.scss"],
})
export class CustomerComponent implements OnInit {
  /* props */
  clientListDataSource$: Observable<any>;
  formatDate = new FormatDate();
  customDate = new CustomJs();
  fromDate: any;
  fromDate2: any;
  toDate: any;
  clientListTable: any[] = [];
  displayedColumns: string[] = [
    "S.n",
    'id',
    "name",
    "address",
    "mobile",
    // "visitType",
    "visitDate",
    "action",
  ];
  customerListTableDataSource = new MatTableDataSource(this.clientListTable);

  /* displaying nepali date */
  fromDateFormatter: DateFormatter = (date) => {
    return this.formatDate.getFormatDate(date);
  };
  toDateFormatter: DateFormatter = (date) => {
    return this.formatDate.getFormatDate(date);
  };

  clientListDataSource: Customer[];
  /* fake data end */
  constructor(
    private clientService: ClientService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fetchClientList();
  }
  fetchClientList() {
    console.log("calling fetchcustomer list");

    this.spinner.show();
    this.clientListDataSource$ = this.clientService
      .getCustomerList()
      .pipe(finalize(() => this.spinner.hide()))
      .pipe(
        tap((res) => {
          console.log(res);
          this.clientListDataSource = res;
        })
      );
    (err) => {
      this.toastr.error(err.message);
      this.spinner.hide();
    };
  }

  onSearch() {
    console.log();
  }

  onAdd(mode?: string, customer?: Customer) {
    const dialogRef = this.dialog.open(CustomerFormComponent, {
      disableClose: true,
      // width: "450px",
      data: {
        mode: mode,
        customerDetails: customer,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // table refresh on cancel nagarne
      console.log(result);
      //if response is not list -->  refreshing particular segment
      if (result !== "cancel") {
        this.fetchClientList();
      }
    });
  }

  onViewDetails(customer: Customer) {
    console.log(customer);
    this.router.navigate(["/dental/customer/visits"], {
      queryParams: { customerId: customer.id },
    });
  }
}
