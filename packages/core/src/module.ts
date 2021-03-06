import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxFormValidatorDirective } from './directives/form-validator.directive';
import { NgxFormSubmitDirective } from './directives/form-submit.directive';
import { MaxValidatorDirective, MinValidatorDirective } from './directives/validators';

import { NgxValidatorGlobalConfig, NGX_VALIDATOR_CONFIG } from './validator.class';

const declarations = [NgxFormValidatorDirective, NgxFormSubmitDirective, MaxValidatorDirective, MinValidatorDirective];

@NgModule({
    declarations: declarations,
    imports: [FormsModule],
    exports: [...declarations, FormsModule]
})
export class NgxValidatorModule {
    static forRoot(config: NgxValidatorGlobalConfig): ModuleWithProviders {
        return {
            ngModule: NgxValidatorModule,
            providers: [
                {
                    provide: NGX_VALIDATOR_CONFIG,
                    useValue: config
                }
            ]
        };
    }
}
