import { ItemList } from "./../../../../../../core/models/item-list.model";
import { CustomJs } from "src/app/shared/customjs/custom.js";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { VisitDetail } from "./../../../../../../core/models/visit-detail.model";
import { Component, Inject, OnInit } from "@angular/core";
import { DateFormatter } from "angular-nepali-datepicker";
import { FormatDate } from "src/app/core/constants/format-date";
import { DatePipe } from "@angular/common";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { CustomerFormComponent } from "src/app/features/customer/shared/customer-form/customer-form.component";
import { VisitDetailService } from "../../services/visit-detail.service";
import { finalize, tap } from "rxjs/operators";

@Component({
  selector: "app-visit-detail-form",
  templateUrl: "./visit-detail-form.component.html",
  styleUrls: ["./visit-detail-form.component.scss"],
})
export class VisitDetailFormComponent implements OnInit {
  /* props */
  visitDetail = new VisitDetail();
  itemListObj = new ItemList();
  formatDate = new FormatDate();
  customDate = new CustomJs();
  visitDetailForm: FormGroup;

  visitTypeList: [] = [];
  mode = "add";
  status = "visit";

  visitDateBs: string;
  isItToday: boolean;
  loading: boolean;
  visitMainId: number;

  visitDateFormatter: DateFormatter = (date) => {
    return this.formatDate.getFormatDate(date);
  };

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private visitDetailService: VisitDetailService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public datepipe: DatePipe,
    public dialogRef: MatDialogRef<VisitDetailFormComponent>,
    @Inject(MAT_DIALOG_DATA) private modalData: any
  ) {}

  ngOnInit(): void {
    console.log(this.modalData);

    this.mode = this.modalData.mode;
    this.mode === "add"
      ? this.fetchDefaultaFormValues()
      : this.fetchVisitDetailForm();
    this.buildVisitDetailForm();
  }

  /* test end */

  fetchQueryParmValues() {
    /* for add */
    this.route.queryParamMap.subscribe((params) => {
      this.visitMainId = +params.get("visitMainId");
    }),
      (err) => {
        err = err.error.message
          ? this.toastr.error(err.error.message)
          : this.toastr.error("Error fetching param value.");
        this.spinner.hide();
      };
  }
  fetchDefaultaFormValues() {
    this.fetchQueryParmValues();
    this.visitDetailService
      .getVisitDetailFormValues(this.visitMainId)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe((res: any) => {
        console.log(res);
        this.visitDetail = res.form;
        this.isItToday = res.form.today;

        this.visitTypeList = res.visitTypeList;
        this.buildVisitDetailForm();
      });
  }

  fetchVisitDetailForm() {
    let visitDetailId = this.modalData?.visitDetails?.id;
    let visitMainId = this.modalData?.visitDetails?.customerId;

    this.mode = "edit";
    this.visitDetailService
      .getVisitMainFormValuesForEdit(visitDetailId, visitMainId)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe((res: any) => {
        this.visitDetail = res.form;
        this.isItToday = res.form.today;
        this.visitTypeList = res.visitTypeList;
        this.visitDateBs = this.customDate.getDatePickerObject(this.visitDetail.visitDateBs);

        this.buildVisitDetailForm();
      }),
      (err) => {
        err = err.error.message
          ? this.toastr.error(err.error.message)
          : this.toastr.error("Error fetching  visit main form values.");
        this.spinner.hide();
      };
  }

  buildVisitDetailForm() {
    if (this.mode === "add") {
      this.visitDetailForm = this.fb.group({
        visitMainId: [this.visitDetail.visitMainId],
        dovisitMainIdctor: [this.visitDetail.doctor],
        visitDateBs: [this.visitDetail.visitDateBs],
        doctor: [this.visitDetail.doctor],
        visitAfterDay: [this.visitDetail.visitAfterDay],
        today: [this.visitDetail.today],
        itemList: this.fb.array([this.buildItemListForm()]),
      });
    } else {
      this.visitDetailForm = this.fb.group({
        id: [this.visitDetail.id],
        visitMainId: [this.visitDetail.visitMainId],
        visitDateBs: [this.visitDetail.visitDateBs],
        doctor: [this.visitDetail.doctor],
        today: [this.visitDetail.today],
        visitAfterDay: [this.visitDetail.visitAfterDay],
        itemList: this.fb.array([]),
      });
      this.setItemList();
    }
  }

  itemList(): FormArray {
    return this.visitDetailForm.get("itemList") as FormArray;
  }

  buildItemListForm() {
    return this.fb.group({
      id: [this.itemListObj.id],
      visitDetailId: [this.itemListObj.visitDetailId],
      amount: [this.itemListObj.amount],
      visitType: [this.itemListObj.visitType],
    });
  }

  addItemList() {
    this.itemList().push(this.buildItemListForm());
  }

  removeItemList(i: number) {
    if (this.itemList().length === 1) {
      this.visitDetailForm.controls["itemList"].reset();
    } else {
      this.itemList().removeAt(i);
    }
  }
  /* setting formArray vales on Edit */
  setItemList() {
    let control = <FormArray>this.visitDetailForm.controls.itemList;
    this.visitDetail.itemList.forEach((x) => {
      control.push(this.fb.group(x));
    });
  }
  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    console.log(this.visitDetailForm.value);
    let visitDateBs = this.customDate.getStringFromNepaliFunction(this.visitDateBs);
    console.log(visitDateBs);

    this.visitDetailForm.controls["visitDateBs"].setValue(visitDateBs);

    if (this.visitDetailForm.valid) {
      this.loading = true;
      this.visitDetailService
        .saveVisitMainForm(this.visitDetailForm.value)
        .subscribe(
          (res) => {
            this.loading = false;
            this.dialogRef.close(res);
          },
          (err) => {
            this.loading = false;

            err.error.message === err.error.message
              ? this.toastr.error(err.error.message)
              : this.toastr.error("Error  saving customer details.");
          }
        );
    }
    return;
  }

  onDayCheck(e) {
    console.log(e);

    this.isItToday = e.checked;
  }
  /* comparing the dropdown values & setting the selected value in edit form */
  compareFn(optionOne: any, optionTwo: any): boolean {
    return optionOne?.id === optionTwo?.id;
  }
}