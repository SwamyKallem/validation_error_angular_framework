import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import {FormControl, NgControl, ValidationErrors} from "@angular/forms";
import {Subscription} from "rxjs";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import Message from "../../assets/messages.json";

@Directive({
  selector: '[appFormValidationMsg]'
})
export class FormValidationMsgDirective implements OnInit,OnDestroy{

  constructor(private elRef: ElementRef,
              private control: NgControl,
              private matIconRegistry:MatIconRegistry,
              private domSanitizer: DomSanitizer
  ) { }

  @Input() validationMsgId: string ;
  @Input() blurFlag: boolean = false;
  errorSpanId: string='';
  statusChangeSubscription: Subscription;

  ngOnInit(): void {
    this.errorSpanId =  String(this.control?.name)+"-"+Math.random() + '-error-msg';
    if(!this.blurFlag) {
      this.formControlStatusChange();
    }
  }

  formControlStatusChange(){
    this.statusChangeSubscription = this.control?.statusChanges.subscribe(
      (status) => { status == 'INVALID' ?  this.showError() : this.removeError(); }
    )
  }

  @HostListener('blur',["$event"])
  handleBlurEvent(event){
    if (this.control.value == null || this.control.value == '') {
      this.control.errors  ?  this.showError() : this.removeError();
    }
    if(this.blurFlag){
      this.formControlStatusChange();
      this.control.control.markAsTouched({onlySelf:false})
      this.getFormControl().updateValueAndValidity({onlySelf:false,emitEvent:true})
      this.blurFlag = false;
    }
  }

  getFormControl(): FormControl {
    return this.control?.control as FormControl;
  }

  public showError() {
    this.removeError();
    const valErrors: ValidationErrors = this.control.errors;
    const errorMsg = this.getMessageKey(Object.entries(valErrors)[0]);
    const  errSpan = '<div style="color:#DB3321;margin-top: -14px;" id="' + this.errorSpanId + '">' +
      '<img alt="error-icon" src="./assets/error.png" width="16px" height="16px" style="margin-bottom: -2px; padding-right: 8px">' + errorMsg + '</div>';
    const  errRadioSpan = '<div style="color:#DB3321" id="' + this.errorSpanId + '">' +
      '<img alt="error-icon" src="./assets/error-f--xs.svg" width="16px" height="16px" style="margin-bottom: -2px; padding-right: 8px">' + errorMsg + '</div>';
    this.domSanitizer.bypassSecurityTrustHtml(errSpan);
    this.domSanitizer.bypassSecurityTrustHtml(errRadioSpan);
    const closestMatFormField = this.elRef.nativeElement.closest('mat-form-field');
    const closestMatRadioGroup = this.elRef.nativeElement.closest('mat-radio-group');
    if(closestMatFormField){
      closestMatFormField.insertAdjacentHTML('beforeend',errSpan);
    }else if(closestMatRadioGroup){
      closestMatRadioGroup.insertAdjacentHTML('afterend',errRadioSpan);
    }
  }
  public removeError() {
    const errorElement = document.getElementById(this.errorSpanId);
    if(errorElement) errorElement.remove();
  }

  public getMessageKey(validationError:any){

    let errorMessageKey = validationError[0]+ '-msg';
    if(this.validationMsgId){
      errorMessageKey = this.validationMsgId + '-' + errorMessageKey
    }

   return Message[errorMessageKey]?.replace("%s",String(validationError[1]?.requiredLength)?.trim());
  }
  ngOnDestroy() {
    this.statusChangeSubscription?.unsubscribe();
  }
}
