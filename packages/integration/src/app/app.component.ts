import { Component } from '@angular/core';
import { NgxValidatorConfig } from '../../../core/src/public_api';
import { exampleCode } from './example-code';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    message = '';

    exampleCode = exampleCode;

    model = {
        username: '',
        email: '',
        password: '',
        number: 0
    };

    validatorConfig: NgxValidatorConfig = {
        validationMessages: {
            username: {
                required: '用户名不能为空',
                pattern: '用户名格式不正确，以字母，数字，下划线组成，首字母不能为数字，必须是2-20个字符'
            }
        }
    };

    setMessage(message: string) {
        this.message = message;
    }

    submit() {
        this.setMessage('This form has submit');
    }
}
