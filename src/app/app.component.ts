import { Component } from '@angular/core';
import { FormGroup,  FormBuilder,  Validators,FormControl } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {
  userAddressValidations: FormGroup;
firstError :string;
constructor(private formBuilder: FormBuilder) { }
ngOnInit() {
  this.userAddressValidations = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20), Validators.pattern('[a-zA-Z]+')]],
    lastName: ['', [Validators.required, Validators.minLength(4),Validators.maxLength(20)]],
     location: ['', [Validators.required, Validators.minLength(4),Validators.maxLength(20)]]
  });

}
onSubmit() {
const props = Object.keys(this.userAddressValidations.value)

}


}