export enum EnumStatusProcessCustomerContact {
    init = "init",
    contacted = "contacted",
    cannot_contact = "cannot_contact",
    done = "done"
}

export const status_process_customer_contact_list = [
    { value: EnumStatusProcessCustomerContact.init, label: "Mới" },
    { value: EnumStatusProcessCustomerContact.contacted, label: "Đã liên hệ" },
    { value: EnumStatusProcessCustomerContact.cannot_contact, label: "Không liên hệ được" },
    { value: EnumStatusProcessCustomerContact.done, label: "Đã hợp tác" }
]
