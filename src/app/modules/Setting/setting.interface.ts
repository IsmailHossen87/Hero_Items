export enum ISettingType {
    globalSetting = "globalSetting",
    termsCondition = "termsCondition",
    privacyPolicy = "privacyPolicy",
}

export interface SettingInterface {
    globalSettingType: ISettingType,
    description: string,
    websiteName: string,
    image: string,
    voteLimit: number,
    timezone: Date,
}