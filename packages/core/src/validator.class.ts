import { InjectionToken } from '@angular/core';
import { IValidationFeedbackStrategy } from './strategies';

export interface Dictionary<T> {
    [key: string]: T;
}
/**
 * 定义验证提示数据结构 key,value键值对
 * Dictionary<T> 是基础的key,value键值对
 * Dictionary<Dictionary<string>> 两层的key,value键值对，第一层是表单字段对应验证（一个字段可能从多个维度验证，非空、正则格式等），第二层是每个验证维度和对应的提示
 */
export declare type NgxValidationMessages = Dictionary<Dictionary<string>>;

export interface NgxValidatorConfig {
    validationFeedbackStrategy?: IValidationFeedbackStrategy;
    validationMessages?: NgxValidationMessages;
}
export interface NgxValidatorGlobalConfig extends NgxValidatorConfig {
    globalValidationMessages?: Dictionary<string>;
}

export const NGX_VALIDATOR_CONFIG = new InjectionToken<NgxValidatorGlobalConfig>('NGX_VALIDATION_CONFIG');

export const DEFAULT_GLOBAL_VALIDATION_MESSAGES = {
    required: '该选项不能为空',
    maxlength: '该选项输入值长度不能大于{requiredLength}',
    minlength: '该选项输入值长度不能小于{requiredLength}',
    thyUniqueCheck: '输入值已经存在，请重新输入',
    email: '输入邮件的格式不正确',
    repeat: '两次输入不一致',
    pattern: '该选项输入格式不正确',
    number: '必须输入数字',
    url: '输入URL格式不正确',
    max: '该选项输入值不能大于{max}',
    min: '该选项输入值不能小于{min}'
};
