import { Directive, OnInit, NgZone, Renderer2, ElementRef, Input, OnDestroy } from '@angular/core';
import { NgxFormValidatorService } from '../validator.service';
import { NgForm } from '@angular/forms';
import { NgxValidatorConfig } from '../validator.class';

const KEY_CODES_ENTER = 13;

// 1. submit 按 Enter 键提交, Textare 除外，需要按 Ctrl | Command + Enter 提交
// 2. alwaysSubmit 不管是哪个元素 按 Enter 键都提交
// 3. forbidSubmit Enter 键禁止提交
// 默认 submit
export enum NgxEnterKeyMode {
    submit = 'submit',
    alwaysSubmit = 'alwaysSubmit',
    forbidSubmit = 'forbidSubmit'
}

@Directive({
    selector: 'form[ngxFormValidator],form[ngx-form-validator]',
    providers: [NgxFormValidatorService],
    exportAs: 'ngxFormValidator'
})
export class NgxFormValidatorDirective implements OnInit, OnDestroy {
    private unsubscribe: () => void;

    onSubmitSuccess: ($event: any) => void;

    @Input() enterKeyMode: NgxEnterKeyMode;

    @Input()
    set ngxFormValidatorConfig(config: NgxValidatorConfig) {
        this.validator.setValidatorConfig(config);
    }

    @Input()
    set ngxFormValidator(config: NgxValidatorConfig) {
        this.validator.setValidatorConfig(config);
    }

    get validator() {
        return this._validator;
    }

    constructor(
        private ngZone: NgZone,
        private renderer: Renderer2,
        private elementRef: ElementRef, // 应该是指当前form元素
        private _validator: NgxFormValidatorService,
        private ngForm: NgForm // 应是封装了表单处理的一些逻辑
    ) {}

    ngOnInit() {
        this.ngZone.runOutsideAngular(() => {
            this.unsubscribe = this.renderer.listen(
                this.elementRef.nativeElement,
                'keydown',
                this.onKeydown.bind(this)
            );
        });

        this.validator.initialize(this.ngForm, this.elementRef.nativeElement);
    }

    submit($event: Event) {
        if (this.validator.validate($event) && this.onSubmitSuccess) {
            this.onSubmitSuccess($event);
        }
    }

    submitRunInZone($event: Event) {
        this.ngZone.run(() => {
            this.submit($event);
        });
    }

    onKeydown($event: KeyboardEvent) {
        const currentInput = document.activeElement;
        const key = $event.which || $event.keyCode;
        if (key === KEY_CODES_ENTER && currentInput.tagName) {
            if (!this.enterKeyMode || this.enterKeyMode === NgxEnterKeyMode.submit) {
                // TEXTAREA Ctrl + Enter 或者 Command + Enter 阻止默认行为并提交
                if (currentInput.tagName === 'TEXTAREA') {
                    if ($event.ctrlKey || $event.metaKey) {
                        $event.preventDefault();
                        this.submitRunInZone($event);
                    }
                } else {
                    // 不是 TEXTAREA Enter 阻止默认行为并提交
                    $event.preventDefault();
                    this.submitRunInZone($event);
                }
            } else if (this.enterKeyMode === NgxEnterKeyMode.alwaysSubmit) {
                $event.preventDefault();
                this.submitRunInZone($event);
            } else {
                // do nothing
            }
        }
    }

    ngOnDestroy(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}
