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