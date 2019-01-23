import { TestBed, tick, fakeAsync, ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { NgxFormValidatorDirective, NgxEnterKeyMode } from './form-validator.directive';
import { NgxValidatorModule } from '../module';
import { NgxValidatorConfig, DEFAULT_GLOBAL_VALIDATION_MESSAGES } from '../validator.class';
import { createFakeEvent, createKeyboardEvent, dispatchEvent } from '../testing';
import { By } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IValidationFeedbackStrategy } from '../strategies';

const INVALID_CLASS = 'is-invalid';
const INVALID_FEEDBACK_CLASS = 'invalid-feedback';

const CUSTOM_INVALID_CLASS = 'custom-invalid';
const CUSTOM_INVALID_FEEDBACK_CLASS = 'custom-invalid-feedback';

/**
 * describe由jasmine提供 用于测试结果的分组
 */
describe('ngxFormValidator', () => {
    describe('Template Driven', () => {
        let fixture: ComponentFixture<SimpleTemplateDrivenDemoComponent>; // ComponentFixture对组件的封装，相当于一个高阶组件，提供对组件的访问

        /**
         * 由jasmine提供，定义当前describe下每个case都要执行的代码
         */
        beforeEach(() => {
            TestBed.configureTestingModule({
                declarations: [SimpleTemplateDrivenDemoComponent],
                imports: [NgxValidatorModule, FormsModule, CommonModule],
                providers: []
            });
            fixture = TestBed.createComponent(SimpleTemplateDrivenDemoComponent);
        });

        function assertEmailFeedbackIsValid() {
            const emailInputElement = fixture.nativeElement.querySelector('#email1');
            const feedbackElement = fixture.nativeElement.querySelector(`.${INVALID_FEEDBACK_CLASS}`);
            expect(emailInputElement.classList.contains(INVALID_CLASS)).toBe(false);
            expect(feedbackElement).toBeFalsy();
            return {
                emailInputElement,
                feedbackElement
            };
        }

        function assertEmailFeedbackError(emailErrorMessage = DEFAULT_GLOBAL_VALIDATION_MESSAGES.required) {
            const emailInputElement = fixture.nativeElement.querySelector('#email1');
            const feedbackElement = fixture.nativeElement.querySelector(`.${INVALID_FEEDBACK_CLASS}`);
            expect(emailInputElement.classList.contains(INVALID_CLASS)).toBe(true);
            /**
             * toBeTruthy Trythy对应验证真值,既：除了false,0,"",null,undefined,NaN（falsy）除外的值
             */
            expect(feedbackElement).toBeTruthy();
            expect(feedbackElement.textContent).toContain(emailErrorMessage);

            return {
                emailInputElement,
                feedbackElement
            };
        }

        function submitFormAndAssertEmailFeedbackError(emailRequiredMessage: string) {
            fixture.componentInstance.ngxFormValidator.submit(createFakeEvent('click'));
            return assertEmailFeedbackError(emailRequiredMessage);
        }

        it('should be created ngxFormValidator directive', () => {
            expect(fixture.componentInstance.ngxFormValidator).toBeTruthy();
        });

        it(`should be same input's config and ngxFormValidator 's config`, () => {
            const inputConfig: NgxValidatorConfig = {
                validationFeedbackStrategy: new CustomValidationFeedbackStrategy(),
                validationMessages: {
                    hello: {
                        required: 'hello is required'
                    }
                }
            };
            fixture.componentInstance.validatorConfig = inputConfig;
            fixture.detectChanges();
            expect(fixture.componentInstance.ngxFormValidator.validator.validatorConfig).toEqual(inputConfig);
        });
        // fakeAsync 伪造异步
        it('should show required error feedback when submit with empty email value', fakeAsync(() => {//异步包裹，代码使用tick就需要包裹
            fixture.detectChanges();
            tick();//模拟ng-zone单击事件的演示
            // const ngxFormValidator = fixture.debugElement.children[0].injector.get(NgxFormValidatorDirective);
            // const ngxFormValidator = fixture.debugElement.query(By.directive(NgxFormValidatorDirective));
            submitFormAndAssertEmailFeedbackError(DEFAULT_GLOBAL_VALIDATION_MESSAGES.required);
        }));

        it('should show config required error feedback when submit with empty email value', fakeAsync(() => {
            const emailRequiredMessage = 'email is required message';
            fixture.componentInstance.validatorConfig = {
                validationMessages: {
                    email: {
                        required: emailRequiredMessage
                    }
                }
            };
            fixture.detectChanges();
            tick();
            submitFormAndAssertEmailFeedbackError(emailRequiredMessage);
        }));

        it('should remove error feedback when input value', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            const { emailInputElement } = submitFormAndAssertEmailFeedbackError(
                DEFAULT_GLOBAL_VALIDATION_MESSAGES.required
            );
            emailInputElement.value = 'invalid email';
            dispatchEvent(emailInputElement, createFakeEvent('input'));
            fixture.detectChanges();
            expect(fixture.componentInstance.model.email).toBe(emailInputElement.value);

            expect(emailInputElement.classList.contains(INVALID_CLASS)).toBe(false);
            const feedbackElement = fixture.nativeElement.querySelector(`.${INVALID_FEEDBACK_CLASS}`);
            expect(feedbackElement).toBeFalsy();

            submitFormAndAssertEmailFeedbackError(DEFAULT_GLOBAL_VALIDATION_MESSAGES.email);
        }));

        it('should remove error feedback when submit after input correct email', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            const { emailInputElement } = submitFormAndAssertEmailFeedbackError(
                DEFAULT_GLOBAL_VALIDATION_MESSAGES.required
            );
            emailInputElement.value = 'why520crazy@163.com';
            dispatchEvent(emailInputElement, createFakeEvent('input'));
            fixture.detectChanges();
            expect(fixture.componentInstance.model.email).toBe(emailInputElement.value);

            fixture.componentInstance.ngxFormValidator.submit(createFakeEvent('click'));

            expect(emailInputElement.classList.contains(INVALID_CLASS)).toBe(false);
            const feedbackElement = fixture.nativeElement.querySelector(`.${INVALID_FEEDBACK_CLASS}`);
            expect(feedbackElement).toBeFalsy();
        }));

        it('should not call submit function when ngForm is invalid', fakeAsync(() => {
            const spy = jasmine.createSpy('submit spy');
            fixture.componentInstance.submit = spy;
            fixture.detectChanges();
            tick();
            expect(spy).not.toHaveBeenCalled();
            fixture.componentInstance.ngxFormValidator.submit(createFakeEvent('click'));
            expect(spy).not.toHaveBeenCalled();
        }));

        it('should call submit function when ngForm is valid', fakeAsync(() => {
            fixture.componentInstance.model.email = 'why520crazy@163.com';
            const spy = jasmine.createSpy('submit spy');
            fixture.componentInstance.submit = spy;
            fixture.detectChanges();
            tick();
            expect(spy).not.toHaveBeenCalled();
            fixture.componentInstance.ngxFormValidator.submit(createFakeEvent('click'));
            expect(spy).toHaveBeenCalled();
        }));

        it('should trigger form submit validate when press enter key and focus on input', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            const emailInputElement = fixture.nativeElement.querySelector('#email1');
            dispatchEvent(emailInputElement, createKeyboardEvent('keydown', 13));
            fixture.detectChanges();
            assertEmailFeedbackError();
        }));

        it('should not trigger form submit validate when press enter key and focus on textarea', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            const textareaInputElement = fixture.nativeElement.querySelector('#description1');
            // focus textareaInputElement
            textareaInputElement.focus();
            dispatchEvent(textareaInputElement, createKeyboardEvent('keydown', 13));
            fixture.detectChanges();
            tick();
            assertEmailFeedbackIsValid();
        }));

        it('should trigger form submit validate when enterKeyMode is alwaysSubmit press enter key and focus on textarea', fakeAsync(() => {
            fixture.componentInstance.enterKeyMode = NgxEnterKeyMode.alwaysSubmit;
            fixture.detectChanges();
            tick();
            const textareaInputElement = fixture.nativeElement.querySelector('#description1');
            // focus textareaInputElement
            textareaInputElement.focus();
            dispatchEvent(textareaInputElement, createKeyboardEvent('keydown', 13));
            fixture.detectChanges();
            tick();
            assertEmailFeedbackError();
        }));
    });
});

@Component({
    selector: 'test-simple-template-driven-demo',
    template: `
        <form name="demoForm" [ngxFormValidator]="validatorConfig" [enterKeyMode]="enterKeyMode">
            <div class="form-group">
                <label for="email1">Email address</label>
                <input
                    type="email"
                    class="form-control"
                    name="email"
                    id="email1"
                    [(ngModel)]="model.email"
                    required
                    email
                    placeholder="Enter email (validators: required & email)"
                />
            </div>
            <div class="form-group">
                <label for="description1">Description1</label>
                <textarea
                    type="text"
                    class="form-control"
                    name="description"
                    id="description1"
                    [(ngModel)]="model.description"
                    placeholder="Enter description"
                ></textarea>
            </div>
            <div><button class="btn btn-primary" (ngxFormSubmit)="submit()">Submit</button></div>
        </form>
    `
})
class SimpleTemplateDrivenDemoComponent {
    enterKeyMode: NgxEnterKeyMode;

    validatorConfig: NgxValidatorConfig = null;

    model = {
        email: '',
        description: ''
    };

    @ViewChild(NgxFormValidatorDirective) ngxFormValidator: NgxFormValidatorDirective;

    constructor() {}

    submit() {}
}

class CustomValidationFeedbackStrategy implements IValidationFeedbackStrategy {
    showError(element: HTMLElement, errorMessages: string[]): void {
        element.classList.add(CUSTOM_INVALID_CLASS);
        if (element && element.parentElement) {
            const documentFrag = document.createDocumentFragment();
            const node = document.createElement('SPAN');
            const textNode = document.createTextNode(errorMessages[0]);
            node.appendChild(textNode);
            node.setAttribute('class', CUSTOM_INVALID_FEEDBACK_CLASS);
            documentFrag.appendChild(node);
            element.parentElement.append(documentFrag);
        }
    }

    removeError(element: HTMLElement): void {
        element.classList.remove(CUSTOM_INVALID_CLASS);
        if (element && element.parentElement) {
            const invalidFeedback = element.parentElement.querySelector(`.${CUSTOM_INVALID_FEEDBACK_CLASS}`);
            if (invalidFeedback) {
                element.parentElement.removeChild(invalidFeedback);
            }
        }
    }
}
