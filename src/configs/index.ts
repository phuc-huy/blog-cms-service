import { Rule } from "antd/es/form"
import { config_lang } from "./lang"
import { EnumLevel } from "types/enum"

export const RULE_FORM_PASSWORD: Rule[] = [
    { required: true, message: config_lang.message.warning.input_password },
    {
        pattern: /^\S{6,}$/,
        message: config_lang.message.warning.rule_password
    }
]

export const RULE_FORM_VN_PHONE_NUMBER: Rule[] = [
    // { required: true, message: "Bạn chưa nhập số điện thoại" },
    {
        pattern: /^(?:\+?84|0)(?:\d){9,10}$/,
        message: "Không đúng định dạng số điện thoại"
    }
]

export const LIST_COLOR_HEX_SIDE_NOTES = [
    "#e9e96f",
    "#efc0c0",
    "#8ddb8d",
    "#f8cf85",
    "#a8b7dd",
    "#82ffde"
]

export const levelOptions = [
    {
        label: config_lang.common.level_easy,
        value: EnumLevel.easy
    },
    {
        label: config_lang.common.level_medium,
        value: EnumLevel.medium
    },
    {
        label: config_lang.common.level_hard,
        value: EnumLevel.hard
    }
]
