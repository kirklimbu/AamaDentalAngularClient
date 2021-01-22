import { VisitDetailFormComponent } from "./../../shared/visit-detail-form/visit-detail-form.component";
import { VisitDetailService } from "./../../services/visit-detail.service";
import { Observable } from "rxjs";
import { Component, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { MatDialogRef, MatDialog } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { finalize, tap } from "rxjs/operators";
import { VisitMainFormComponent } from "../../../shared/visit-main-form/visit-main-form.component";

@Component({
  selector: "app-visit-detail",
  templateUrl: "./visit-detail.component.html",
  styleUrls: ["./visit-detail.component.scss"],
})
export class VisitDetailComponent implements OnInit {
  /* props */
  visitDetailListDataSource$: Observable<any>;
  visitDetailListDataSource: [] = [];
  displayedColumns: string[] = [
    "S.n",
    "customerId",
    "visitDateBs",
    "doctor",
    "nextVisitDateBs",
    "visitAfterDay",
    "action",
  ];

  visitMainId: number;
  visitType: string;
  label1 = "Visit";
  label2 = "Deposit";
  customerVisitDetail;
  constructor(
    private visitDetailService: VisitDetailService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router,
    public datepipe: DatePipe,
    public dialogRef: MatDialogRef<VisitMainFormComponent>,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchVisitDetailList();
  }

  fetchVisitDetailList() {
    this.spinner.show();
    this.route.queryParamMap.subscribe((params) => {
      this.visitMainId = +params.get("visitMainId");
      // this.visitType = params.get("type");
      let type = "pay";

      this.visitDetailListDataSource$ = this.visitDetailService
        .getVisitDetailList(type, this.visitMainId)
        .pipe(finalize(() => this.spinner.hide()))
        .pipe(
          tap((res) => {
            this.customerVisitDetail = res;
            console.log(this.customerVisitDetail);
          })
        );
    }),
      (err) => {
        err = err.error.message
          ? this.toastr.error(err.error.message)
          : this.toastr.error("Error fetching param value.");
        this.spinner.hide();
      };
  }
  onSearch() {}
  onViewDetails(visit) {}
  onAdd(mode: string, visitDetail?: any) {
    /* START BY CODE REFACTORING FROM HERE */
    console.log(visitDetail);
    const dialogRef = this.dialog.open(VisitDetailFormComponent, {
      disableClose: true,
      height: "auto",

      data: {
        mode: mode,
        visitDetails: visitDetail,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      /* YESKO RESPONSE MA SERVER LE LIST PANI PATHAUXA TESLAI TABLE MA POPULATE GARNE */
      console.log(result);

      if (result === (null || undefined)) {
        /* IF DATA IS NOT ADDED/ MODIFIED */

        this.fetchVisitDetailList();
      } else {
        /* IF NEW DATA IS ADDED/MODIFED
          RESPONSE NULL XAENA SO TABLE MA ASSIGN GARNE */
        // this.visitListDataSource$ = result; //UNCOMMENT AFTER BACKEND SENDS LIST

        this.fetchVisitDetailList(); // REMOVE AFTER BACKEND SENDS LIST
      }
    });
  }
}
