import {FormValidationMsgDirective} from './form-validation-msg.directive';
import {Component, DebugElement} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  NgControl,
  ReactiveFormsModule,
  Validators
} from "@angular/forms"
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";
import {FormSubmitValidationMsgDirective} from "./formSubmit-validation-msg.directive";
import {MatRadioButton, MatRadioModule} from "@angular/material/radio";

@Component({
  template: `
    <form [formGroup]="testForm">
      <input formControlName="testControl" appFormValidationMsg [validationMsgId]="'testControl'">
      <mat-radio-group formControlName="testRequiredControl" appFormValidationMsg
                       [validationMsgId]="'testRequiredControl'">
        <mat-radio-button>Yes</mat-radio-button>
      </mat-radio-group>
      <button appFormSubmitValidationMsg [validationControl]="testForm">Submit</button>
    </form>`

})
class TestComponent {
  testForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.testForm = this.formBuilder.group({
      testControl: ['', [Validators.minLength(3)]],
      testRequiredControl: ['', [Validators.required]]
    });
  }
}

describe('FormValidationMsgDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let debugElement: DebugElement;
  let control: AbstractControl;
  let buttonDebugElement: DebugElement;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, FormValidationMsgDirective, FormSubmitValidationMsgDirective],
      imports: [ReactiveFormsModule, MatRadioModule],
      providers: [FormBuilder, NgControl]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElement = fixture.debugElement.query(By.directive(FormValidationMsgDirective));
    buttonDebugElement = fixture.debugElement.query(By.directive(FormSubmitValidationMsgDirective));
    control = component.testForm.get('testControl');
  });

  it('should create', () => {
    const directive = fixture.debugElement.query(By.directive(FormValidationMsgDirective));
    expect(directive).toBeTruthy();
  });

  it('should show error message on invalid input', () => {
    //Arrange
    const directive = debugElement.injector.get(FormValidationMsgDirective);
    spyOn(directive, "showError");
    // const queryElement = fixture.nativeElement.querySelector('input');
    control.setValue('12');
    //Act
    fixture.detectChanges();
    //Assert
    expect(directive.showError).toHaveBeenCalled();
  });

  it('should remove error message on valid input', () => {
    //Arrange
    const directive = debugElement.injector.get(FormValidationMsgDirective);
    spyOn(directive, "removeError");
    control.setValue('123');
    //Act
    fixture.detectChanges();
    //Assert
    expect(directive.removeError).toHaveBeenCalled()
  });

  it('should show the error message on blur event for invalid input', () => {
    //Arrange
    const directive = debugElement.injector.get(FormValidationMsgDirective);
    spyOn(directive, "showError");
    control.addValidators(Validators.required);
    control.updateValueAndValidity();
    const queryElement = fixture.nativeElement.querySelector('input');
    //Act
    queryElement.dispatchEvent(new Event('blur'));
    //Assert
    expect(directive.showError).toHaveBeenCalled()
  });

  it('should first remove the error message if it is already present', () => {
    //Arrange
    const directive = debugElement.injector.get(FormValidationMsgDirective);
    spyOn(directive, "removeError");
    const queryElement = fixture.nativeElement.querySelector('input');
    control.setValue('');
    //Act
    queryElement.dispatchEvent(new Event('blur'));
    //Assert
    expect(directive.removeError).toHaveBeenCalled()
  });

  it('should remove the error message when control becomes valid', () => {
    //Arrange
    const directive = debugElement.injector.get(FormValidationMsgDirective);
    spyOn(directive, "removeError");
    control.setValue('12');
    fixture.detectChanges();
    control.setValue('123');
    //Act
    fixture.detectChanges();
    //Assert
    expect(directive.removeError).toHaveBeenCalled()
  });

  it('should remove the error message when control is reset', () => {
    //Arrange
    const directive = debugElement.injector.get(FormValidationMsgDirective);
    spyOn(directive, "removeError");
    control.setValue('12');
    fixture.detectChanges();
    control.reset();
    //Act
    fixture.detectChanges();
    //Assert
    expect(directive.removeError).toHaveBeenCalled()
  });

  it('should remove the error message when error element exits', () => {
    //Arrange
    const directive = debugElement.injector.get(FormValidationMsgDirective);
    const errorElement = document.createElement('span');
    errorElement.id = directive['errorSpanId'];
    spyOn(document, 'getElementById').and.returnValue(errorElement);
    directive['removeError']();
    //Act
    //Assert
    expect(document.getElementById).toHaveBeenCalledWith(directive['errorSpanId']);
  });

  it('should call removeError when control has no errors', () => {
    //Arrange
    const directive = debugElement.injector.get(FormValidationMsgDirective);
    spyOn(directive, "showError");
    spyOn(directive, "removeError");
    control.setValue('123');
    //Act
    directive.handleBlurEvent(null);
    //Assert
    expect(directive.showError).not.toHaveBeenCalled();
    expect(directive.removeError).toHaveBeenCalled();
  });

  it('should insert error HTML inside mat-form-field if it exists', () => {
    //Arrange
    const directive = debugElement.injector.get(FormValidationMsgDirective);
    spyOn(document, 'getElementById').and.returnValue(document.createElement('mat-form-field'));
    const el = fixture.nativeElement.querySelector('input')
    spyOn(el, 'closest').and.returnValue(document.createElement('mat-form-field'));
    control.addValidators(Validators.required);
    control.updateValueAndValidity();
    //Act
    directive.showError();
    const insertedHTML = document.getElementById(directive['errorSpanId']).outerHTML;
    //Assert
    expect(insertedHTML).toContain('mat-form-field');
  });

  it('should insert error HTML after mat-radio-group if it exists', () => {
    //Arrange
    const directive = debugElement.injector.get(FormValidationMsgDirective);
    spyOn(document, 'getElementById').and.returnValue(document.createElement('mat-radio-group'));
    const el = fixture.nativeElement.querySelector('input')
    spyOn(el, 'closest').and.returnValue(document.createElement('mat-radio-group'));
    control.addValidators(Validators.required);
    control.updateValueAndValidity();
    //Act
    directive.showError();
    const insertedHTML = document.getElementById(directive['errorSpanId']).outerHTML;
    //Assert
    expect(insertedHTML).toContain('mat-radio-group');
  });

  it('should insert error HTML after mat-radio-group ', () => {
    //Arrange
    const matRadioElement = fixture.debugElement.query(By.directive(MatRadioButton)).nativeElement;
    const closestElement = matRadioElement.closest('mat-radio-group');
    spyOn(closestElement, 'insertAdjacentHTML');
    const button = fixture.nativeElement.querySelector('button');
    //Act
    button.dispatchEvent(new Event('click'));
    //Assert
    expect(closestElement.insertAdjacentHTML).toHaveBeenCalled();
  });

  it('should execute form control status change and update value and validity if blurFlag is true', () => {
    //Arrange
    const directive = debugElement.injector.get(FormValidationMsgDirective);
    spyOn(directive, 'formControlStatusChange');
    spyOn(directive, 'getFormControl').and.callThrough();
    directive.blurFlag = true;
    //Act
    debugElement.triggerEventHandler('blur', null);
    //Assert
    expect(directive.formControlStatusChange).toHaveBeenCalled();
    expect(directive.getFormControl()).toBeInstanceOf(FormControl);
    expect(directive.blurFlag).toBe(false);
  });

});
