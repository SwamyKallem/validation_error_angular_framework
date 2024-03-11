Introduction
In this article, we’ll explore how to build a custom validation message framework for Angular forms. By leveraging a directive and a messages.json file, we can streamline error handling and enhance the user experience.



1. The Problem
Traditionally, developers manually wrote error messages for each input field in reactive forms. This approach led to repetitive code and maintenance challenges. Our goal is to simplify this process and make it more efficient.

 <mat-form-field class="example-full-width">
  <mat-label>Location</mat-label>
  <input matInput formControlName="location">
  <mat-error *ngIf="userAddressValidations.get('location').hasError('required')">
   <mat-icon aria-hidden="false" aria-label="Example home icon" fontIcon="home"></mat-icon>Please fill out this field.
  </mat-error>
  <mat-error *ngIf="userAddressValidations.get('location').hasError('minlength')">
   Minimum 4 characters required.
  </mat-error>
  <mat-error  *ngIf="userAddressValidations.get('location').hasError('maxlength')">
  Accepts only 20 characters.
  </mat-error>
 </mat-form-field>
2. The Solution
By using a directive and messages.json file the above problem code can be reduced to the following code.

<mat-form-field class="example-full-width">
  <mat-label>Last Name</mat-label>
  <input matInput formControlName="lastName" appFormValidationMsg>  
 </mat-form-field>
The below code is for displaying custom error message .

validationMsgId value needs to be passed to validation directive.

<mat-form-field class="example-full-width">
  <input matInput formControlName="firstName" appFormValidationMsg [validationMsgId]="'firstName'" placeholder="First Name">
  
 </mat-form-field>
The below code is for Onblur validation.

The blurFlg value (True) needs to be passed to Validation directive. The validation framework considers the form control as on blur and the validation error message is displayed when the focus goes away from the field. Next time It executes regular validation instead of onblur behaviour

 <mat-form-field class="example-full-width">
  <mat-label>Blur Flag</mat-label>
  <input matInput formControlName="middleName" appFormValidationMsg [blurFlag]="true">  
 </mat-form-field>
2.1. The Directive
Creating the Directive
To create our custom validation message framework, we’ll start by designing a directive. This directive will automatically handle validation messages based on the form control’s state. Here’s how you can create it:

The below code is for field validation- FormValidationMsgDirective.ts

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
The below code is for form submit validation.

FormSubmitValidationMsgDirective.ts

import { Directive, Input, HostListener } from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
@Directive({
  selector: '[appFormSubmitValidationMsg]'
})
export class FormSubmitValidationMsgDirective {

  @Input() validationControl: FormGroup;

  @HostListener('click', ["$event"])
  handleClickEvent(event) {
    this.markAsTouched(this.validationControl);
    return false;
  }
  public markAsTouched(formGroup: FormGroup): void {

        (<any>Object).values(formGroup.controls).forEach( control => {

            if(control.hasValidator(Validators.required) && !control.value){
                control.markAsTouched() ;
                control.updateValueAndValidity({ onlySelf: false, emitEvent: true });
            }
            if (control?.controls) {
                this.markAsTouched(control);
            }
        })
  }

}
2.2. The messages.json File
Structure
The messages.json file should contain a mapping of error keys to actual error messages. For example:

{
  
    "required-msg": "This field is required.",
    "firstName-required-msg": "The first name is required.",
    "maxlength-msg": "%s character limit exceeded.",
    "firstName-maxlength-msg": "%s character limit exceeded.",
    "minlength-msg":"Must be %s numeric digits.",
    "firstName-minlength-msg":"Must be %s numeric digits."
"customMsgId-minlength-msg":"Must be %s numeric digits."
  }
3. Framework Features
3.1. Automatic Validation Messages
Our framework automatically displays validation messages when a form control’s value changes. Here’s how it works:

First-Time Display: The blurFlag ensures that validation messages appear only after the user interacts with the input field.
Subsequent Typing: Once the user starts typing, validation messages appear dynamically based on the input value.
4. Implementation Steps
Let’s walk through the steps to implement our custom validation message framework:

Setting Up the Directive: Add the ValidationMessagesDirective to your Angular project.
Creating the messages.json File: Store it in a central location (e.g., assets folder) and load it during app initialization.
Integrating with Form Controls: Apply the directive to form controls by binding the messages input.
5. Conclusion
Our custom validation message framework simplifies error handling, improves maintainability, and enhances the user experience. By following these steps, you can create a reusable solution for your Angular projects.
